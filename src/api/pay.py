import os
from flask import Blueprint, request, jsonify, abort
import stripe

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
FRONTEND_URL = (os.getenv("FRONTEND_URL") or "http://localhost:3000").rstrip("/")

pay_api = Blueprint("pay_api", __name__)

@pay_api.get("/config")
def config():
    return jsonify({
        "stripe_pk": os.getenv("VITE_STRIPE_PUBLISHABLE_KEY") or os.getenv("STRIPE_PUBLISHABLE_KEY"),
        "paypal_client_id": os.getenv("PAYPAL_CLIENT_ID"),
    })

@pay_api.post("/create-checkout-session")
def create_checkout_session():
    if not stripe.api_key:
        abort(500, description="Falta STRIPE_SECRET_KEY en el backend (.env)")

    data = request.get_json(silent=True) or {}
    # Espera amount en céntimos. Si no llega (modo dev), usa 1 € como fallback.
    try:
        amount = int(data.get("amount", 0))
    except (TypeError, ValueError):
        amount = 0
    if amount <= 0:
        amount = 100  # ⚠️ solo para desarrollo si el frontend no envía total

    currency = (data.get("currency") or "EUR").lower()
    title = data.get("title") or "Pedido SendaSuds"

    session = stripe.checkout.Session.create(
        mode="payment",
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": currency,
                "product_data": {"name": title},
                "unit_amount": amount,
            },
            "quantity": 1,
        }],
        success_url=f"{FRONTEND_URL}/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{FRONTEND_URL}/checkout?canceled=1",
    )
    return jsonify({"id": session["id"], "url": session.get("url")})
