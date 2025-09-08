# src/app.py
from flask import Flask
from flask_cors import CORS
from src.api import api


def create_app() -> Flask:
    """Create and configure the Flask application."""
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    app.register_blueprint(api, url_prefix="/api")
    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3001, debug=True)
