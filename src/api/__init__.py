from flask import Blueprint, jsonify

api = Blueprint("api", __name__)

@api.get("/")
def api_root():
    return jsonify(ok=True, service="backend", root="/api")

@api.get("/health")
def health():
    return jsonify(ok=True)

# usado por tu Checkout.jsx (stub sin Stripe real)
@api.post("/pay/create-checkout-session")
def pay_create_cs():
    # si tuvieras Stripe, devolverías url o sessionId real
    return jsonify(id="cs_test_stub_123", url=None)
