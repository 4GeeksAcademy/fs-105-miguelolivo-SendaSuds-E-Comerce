from flask import Blueprint, jsonify, abort

products_api = Blueprint("products_api", __name__)

_PRODUCTS = [
    {"id": 1, "name": "Coco Tropical"},
    {"id": 2, "name": "Cítrico Amanecer"},
    {"id": 3, "name": "Menta Alpina"},
    {"id": 4, "name": "Carbón Activo"},
    {"id": 5, "name": "Rosa Mosqueta"},
    {"id": 6, "name": "Avena & Miel"},
    {"id": 7, "name": "Lavanda Serena"},
    {"id": 8, "name": "Aloe Vera"},
    {"id": 9, "name": "Bosque Fresco"},
]

@products_api.get("/")
def list_products():
    return jsonify(results=_PRODUCTS)

@products_api.get("/<int:item_id>")
def product_detail(item_id: int):
    prod = next((p for p in _PRODUCTS if p["id"] == item_id), None)
    if not prod:
        abort(404, description="Product not found")
    return jsonify(prod)

def _next_id():
    return max((p["id"] for p in _PRODUCTS), default=0) + 1

@products_api.post("/")
def create_product():
    from flask import request, abort, jsonify
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    price = data.get("price", None)

    if not name:
        abort(400, description="name is required")

    if price is not None:
        try:
            price = float(price)
            if price < 0:
                raise ValueError()
        except (TypeError, ValueError):
            abort(400, description="price must be a non-negative number")

    new_item = {"id": _next_id(), "name": name}
    if price is not None:
        new_item["price"] = price

    _PRODUCTS.append(new_item)
    return jsonify(new_item), 201

@products_api.patch("/<int:item_id>")
def update_product(item_id: int):
    from flask import request, abort, jsonify
    data = request.get_json(silent=True) or {}

    # buscar producto
    prod = next((p for p in _PRODUCTS if p["id"] == item_id), None)
    if not prod:
        abort(404, description="Product not found")

    # validar y aplicar cambios
    if "name" in data:
        name = (data.get("name") or "").strip()
        if not name:
            abort(400, description="name cannot be empty")
        prod["name"] = name

    if "price" in data:
        try:
            price = float(data.get("price"))
            if price < 0:
                raise ValueError()
        except (TypeError, ValueError):
            abort(400, description="price must be a non-negative number")
        prod["price"] = price

    return jsonify(prod)

@products_api.delete("/<int:item_id>")
def delete_product(item_id: int):
    from flask import abort, jsonify
    # Protección: no permitir borrar los 9 productos semilla
    if 1 <= item_id <= 9:
        abort(403, description="deleting seed products is disabled in this phase")

    # Buscar índice del producto
    idx = next((i for i, p in enumerate(_PRODUCTS) if p["id"] == item_id), None)
    if idx is None:
        abort(404, description="Product not found")

    removed = _PRODUCTS.pop(idx)
    return jsonify(ok=True, deleted=removed["id"])

# --- seed de precios para los 9 productos iniciales (solo si falta) ---
_PRICE_SEED = {
    1: 5.00, 2: 6.20, 3: 5.50, 4: 7.00, 5: 6.80,
    6: 5.80, 7: 6.00, 8: 5.40, 9: 6.30
}
for _p in _PRODUCTS:
    if "price" not in _p or _p["price"] is None:
        _p["price"] = _PRICE_SEED.get(_p["id"])
