# src/api/payments.py
import os, stripe
from flask import Blueprint, request, jsonify

bp = Blueprint("payments", __name__)
stripe.api_key = os.environ["STRIPE_SECRET_KEY"]
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# TODO: reemplaza por tu lectura real del carrito desde DB
def get_cart_items_for_current_user():
    # Ejemplo fijo (coge de tu DB real!)
    return [
        {"name": "Rosa Mosqueta", "price": 9.50, "qty": 1},
        # ...
    ]

@bp.route("/pay/create-checkout-session", methods=["POST"])
def create_checkout_session():
    items = get_cart_items_for_current_user()
    line_items = []
    for it in items:
        if it["qty"] > 0 and it["price"] > 0:
            line_items.append({
                "price_data": {
                    "currency": "eur",
                    "product_data": {"name": it["name"]},
                    "unit_amount": int(round(it["price"] * 100)),
                },
                "quantity": int(it["qty"]),
            })
    if not line_items:
        return jsonify({"error": "Carrito vacío"}), 400

    session = stripe.checkout.Session.create(
        mode="payment",
        line_items=line_items,
        success_url=f"{FRONTEND_URL}/success?provider=stripe&session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{FRONTEND_URL}/checkout?canceled=1",
        automatic_tax={"enabled": False},
    )
    return jsonify({"id": session.id, "url": session.url})

@bp.route("/pay/webhook", methods=["POST"])
def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get("Stripe-Signature", "")
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.environ["STRIPE_WEBHOOK_SECRET"]
        )
    except Exception as e:
        return str(e), 400

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        # TODO: marcar pedido como pagado en tu DB y vaciar carrito del usuario
    return "", 200
