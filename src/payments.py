import os, json
from flask import Blueprint, request, jsonify

bp = Blueprint("payments", __name__, url_prefix="/api/checkout")

def _build_line_items_from_payload(items, currency="usd"):
    line_items = []
    for it in items:
        # Mínimo viable: confiar en payload en modo FAKE (NO para producción real)
        name = it.get("name", "Item")
        amount = int(it.get("unit_amount", 0))
        qty = int(it.get("quantity", 1))
        if amount > 0 and qty > 0:
            line_items.append({
                "price_data": {
                    "currency": currency,
                    "product_data": {"name": name},
                    "unit_amount": amount
                },
                "quantity": qty
            })
    return line_items

@bp.route("/create", methods=["POST"])
def create_checkout():
    data = request.get_json(silent=True) or {}
    items = data.get("items") or []
    if not items:
        return jsonify({"error": "Empty cart"}), 400

    # Modo FAKE por defecto para desarrollo/CI
    if os.getenv("STRIPE_FAKE", "1") == "1":
        return jsonify({
            "checkout_url": "https://example.test/checkout/session/fake",
            "session_id": "cs_test_fake"
        }), 200

    # Modo REAL (Stripe)
    import stripe
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
    currency = os.getenv("CURRENCY", "usd")
    li = _build_line_items_from_payload(items, currency=currency)
    if not li:
        return jsonify({"error": "Invalid items"}), 400

    session = stripe.checkout.Session.create(
        mode="payment",
        line_items=li,
        success_url=data.get("success_url", "http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}"),
        cancel_url=data.get("cancel_url", "http://localhost:5173/cancel"),
        metadata={"source": "api"}
    )
    return jsonify({"checkout_url": session.url, "session_id": session.id}), 200

@bp.route("/webhook", methods=["POST"])
def webhook():
    # En modo FAKE no verificamos firma
    if os.getenv("STRIPE_FAKE", "1") == "1":
        return "ok", 200

    import stripe
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
    secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    sig = request.headers.get("Stripe-Signature")
    try:
        event = stripe.Webhook.construct_event(request.data, sig, secret)
    except Exception:
        return "invalid", 400

    # Aquí podrías marcar la orden como pagada cuando:
    # if event["type"] == "checkout.session.completed": ...
    return "ok", 200
