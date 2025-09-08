from flask import Blueprint, jsonify, request, abort

checkout_api = Blueprint("checkout_api", __name__)

@checkout_api.post("/create")
def create_payment():
    data = request.get_json(silent=True) or {}
    try:
        amount = int(data.get("amount", 0))
    except (TypeError, ValueError):
        abort(400, description="amount must be an integer")
    if amount <= 0:
        abort(400, description="amount must be > 0")
    # Stub: aquí iría la integración real (Stripe/PayPal...)
    return jsonify(ok=True, payment_intent_id="pi_stub_123", client_secret="secret_stub"), 201
@checkout_api.post("/confirm")
def confirm_payment():
    from flask import request, abort, jsonify
    data = request.get_json(silent=True) or {}
    pi = data.get("payment_intent_id")
    if not pi:
        abort(400, description="payment_intent_id is required")
    return jsonify(ok=True, status="succeeded", payment_intent_id=pi)
