from flask import Blueprint, jsonify

health_api = Blueprint("health_api", __name__)

@health_api.get("/health")
def health():
    return jsonify(ok=True)
