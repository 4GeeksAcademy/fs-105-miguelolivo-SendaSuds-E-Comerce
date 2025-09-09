from flask import Flask
from flask_cors import CORS

from src.api import api
from src.api.products import products_api
from src.api.cart import cart_api
from src.api.users import users_api

def create_app() -> Flask:
    app = Flask(__name__)
    app.config["JSON_AS_ASCII"] = False
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    app.register_blueprint(api, url_prefix="/api")
    app.register_blueprint(products_api, url_prefix="/api/products")
    app.register_blueprint(cart_api, url_prefix="/api/cart")
    app.register_blueprint(users_api, url_prefix="/api/users")
    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3001, debug=True)
