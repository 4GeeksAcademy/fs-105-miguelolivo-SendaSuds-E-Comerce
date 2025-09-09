from flask import Blueprint, jsonify, request, abort

cart_api = Blueprint("cart_api", __name__)

# carrito en memoria (demo)
_CART = [
    {"product_id": 1, "qty": 1},
    {"product_id": 2, "qty": 2},
]

def _find_index(pid: int):
    for i, it in enumerate(_CART):
        if it["product_id"] == pid:
            return i
    return None

@cart_api.get("/")
def list_cart():
    return jsonify(ok=True, items=_CART)

# NUEVO: usado por el front
@cart_api.post("/set-qty")
def set_qty():
    data = request.get_json(silent=True) or {}
    try:
        pid = int(data.get("product_id"))
        qty = int(data.get("qty"))
    except (TypeError, ValueError):
        abort(400, description="product_id and qty must be integers")
    if qty < 0:
        abort(400, description="qty must be >= 0")

    idx = _find_index(pid)
    if qty == 0:
        if idx is not None:
            _CART.pop(idx)
    else:
        if idx is None:
            _CART.append({"product_id": pid, "qty": qty})
        else:
            _CART[idx]["qty"] = qty
    return jsonify(ok=True, items=_CART)

# NUEVO: usado por el front
@cart_api.delete("/item/<int:pid>")
def remove_item_new(pid: int):
    idx = _find_index(pid)
    if idx is None:
        abort(404, description="item not in cart")
    _CART.pop(idx)
    return jsonify(ok=True, items=_CART)

# COMPAT: soporta el viejo PUT /api/cart/<pid>
@cart_api.put("/<int:pid>")
def set_qty_compat(pid: int):
    data = request.get_json(silent=True) or {}
    try:
        qty = int(data.get("qty"))
    except (TypeError, ValueError):
        abort(400, description="qty must be integer")
    if qty < 0:
        abort(400, description="qty must be >= 0")
    idx = _find_index(pid)
    if qty == 0:
        if idx is not None:
            _CART.pop(idx)
    else:
        if idx is None:
            _CART.append({"product_id": pid, "qty": qty})
        else:
            _CART[idx]["qty"] = qty
    return jsonify(ok=True, items=_CART)

# COMPAT: viejo DELETE /api/cart/<pid>
@cart_api.delete("/<int:pid>")
def remove_item_old(pid: int):
    idx = _find_index(pid)
    if idx is None:
        abort(404, description="item not in cart")
    _CART.pop(idx)
    return jsonify(ok=True, items=_CART)
