from src.api.checkout import checkout_api
from src.api.cart import cart_api
from src.api.users import users_api
from src.api.auth import auth_api
from flask import Flask
from flask_cors import CORS
from src.api import api
from src.api.products import products_api


def create_app() -> Flask:
    """Create and configure the Flask application."""
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    app.register_blueprint(api, url_prefix="/api")
    app.register_blueprint(checkout_api, url_prefix="/api/checkout")
    app.register_blueprint(cart_api, url_prefix="/api/cart")
    app.register_blueprint(users_api, url_prefix="/api/users")
    app.register_blueprint(auth_api, url_prefix="/api/auth")
    app.register_blueprint(products_api, url_prefix="/api/products")
    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3001, debug=True)

# --- register payments blueprint ---
try:
    from src.payments import bp as payments_bp
    app.register_blueprint(payments_bp)
except Exception as e:
    print("payments blueprint not loaded:", e)
