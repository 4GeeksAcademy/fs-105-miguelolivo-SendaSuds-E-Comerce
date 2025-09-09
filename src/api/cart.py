from flask import Blueprint, jsonify

cart_api = Blueprint("cart_api", __name__)

_CART = {}  # {product_id(str): qty(int)}

@cart_api.get("/")
def get_cart():
    items = [{"product_id": int(pid), "qty": qty} for pid, qty in _CART.items()]
    return jsonify(items=items)
from flask import request, abort

@cart_api.post("/")
def add_to_cart():
    data = request.get_json(silent=True) or {}
    try:
        pid = int(data.get("product_id", 0))
        qty = int(data.get("qty", 1))
    except (TypeError, ValueError):
        abort(400, description="product_id and qty must be integers")

    if pid <= 0 or qty <= 0:
        abort(400, description="product_id>0 and qty>0 are required")

    _CART[str(pid)] = _CART.get(str(pid), 0) + qty
    items = [{"product_id": int(k), "qty": v} for k, v in _CART.items()]
    return jsonify(ok=True, items=items), 201
@cart_api.patch("/<int:product_id>")
def set_qty(product_id: int):
    from flask import request, abort, jsonify
    data = request.get_json(silent=True) or {}
    try:
        qty = int(data.get("qty", -1))
    except (TypeError, ValueError):
        abort(400, description="qty must be an integer")
    if qty < 0:
        abort(400, description="qty must be >= 0")

    key = str(product_id)
    if qty == 0:
        _CART.pop(key, None)
    else:
        _CART[key] = qty

    items = [{"product_id": int(k), "qty": v} for k, v in _CART.items()]
    return jsonify(ok=True, items=items)

@cart_api.delete("/<int:product_id>")
def remove_item(product_id: int):
    key = str(product_id)
    _CART.pop(key, None)
    from flask import jsonify
    items = [{"product_id": int(k), "qty": v} for k, v in _CART.items()]
    return jsonify(ok=True, items=items)

@cart_api.post("/clear")
def clear_cart():
    _CART.clear()
    from flask import jsonify
    return jsonify(ok=True, items=[])
