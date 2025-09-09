from flask import Flask, Blueprint, jsonify, send_from_directory
from flask_cors import CORS
import os

# sirve /static/* desde la carpeta ./static
app = Flask(__name__, static_url_path="/static", static_folder="static")
CORS(app, resources={r"/api/*": {"origins": "*"}})

api = Blueprint("api", __name__, url_prefix="/api")

@api.get("/hello")
def hello():
    return jsonify(message="Hola desde Flask!")

@api.get("/products")
def products():
    return jsonify([
        {"id": 1, "name": "Jabón Rose", "price": 6.5, "image": "/static/products/rose.jpg"},
        {"id": 2, "name": "Jabón Aloe", "price": 5.9, "image": "/static/products/aloe.jpg"},
    ])

# puente opcional: /api/static/products/<archivo> -> ./static/products/<archivo>
@api.get("/static/products/<path:filename>")
def product_file(filename):
    return send_from_directory(os.path.join(app.static_folder, "products"), filename)

app.register_blueprint(api)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3001, debug=True)
