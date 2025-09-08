from flask import Blueprint, jsonify, request, abort

auth_api = Blueprint("auth_api", __name__)

@auth_api.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""
    if not email or not password:
        abort(400, description="email and password are required")
    # TODO: persistir en BD (por ahora stub)
    return jsonify(ok=True, user={"id": 1, "email": email}), 201
@auth_api.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""
    if not email or not password:
        abort(400, description="email and password are required")
    # TODO: validar credenciales contra BD; por ahora stub
    return jsonify(ok=True, token="stub-token-123", user={"id": 1, "email": email})
