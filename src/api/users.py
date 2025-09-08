from flask import Blueprint, jsonify, request, abort

users_api = Blueprint("users_api", __name__)

# Stub de usuario "logueado"
_USER = {"id": 1, "email": "demo@example.com", "name": "Demo"}

@users_api.get("/me")
def me():
    return jsonify(_USER)

@users_api.patch("/me")
def update_me():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        abort(400, description="name is required")
    _USER["name"] = name
    return jsonify(_USER)

@users_api.delete("/me")
def delete_me():
    # Stub: aquí borraríamos el usuario en BD y su sesión
    return jsonify(ok=True, deleted=True)
