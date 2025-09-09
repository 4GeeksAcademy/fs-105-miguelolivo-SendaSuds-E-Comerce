from flask import Blueprint, jsonify, abort

products_api = Blueprint("products_api", __name__)

_PRODUCTS = [
    {"id": 1, "name": "Coco Tropical",    "price": 5.00},
    {"id": 2, "name": "Cítrico Amanecer",  "price": 6.20},
    {"id": 3, "name": "Menta Alpina",      "price": 5.50},
    {"id": 4, "name": "Carbón Activo",     "price": 7.00},
    {"id": 5, "name": "Rosa Mosqueta",     "price": 6.80},
    {"id": 6, "name": "Avena & Miel",      "price": 5.80},
    {"id": 7, "name": "Lavanda Serena",    "price": 6.00},
    {"id": 8, "name": "Aloe Vera",         "price": 5.40},
    {"id": 9, "name": "Bosque Fresco",     "price": 6.30},
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
