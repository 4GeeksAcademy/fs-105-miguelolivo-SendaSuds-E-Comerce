from flask import Blueprint, jsonify

users_api = Blueprint("users_api", __name__)

_FAKE_USER = {
    "id": 1,
    "email": "demo@sendasuds.test",
    "name": "Demo User",
}

@users_api.get("/me")
def me():
    return jsonify(_FAKE_USER)
