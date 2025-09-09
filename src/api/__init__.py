from flask import Blueprint, jsonify

api = Blueprint("api", __name__)

@api.get("/ping")
def ping():
    return jsonify(ok=True, message="pong")

@api.get("/hello")
def hello():
    # La plantilla del front espera esta clave "message"
    return jsonify(message="Hello from Flask! 🚀")
