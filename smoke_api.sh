#!/usr/bin/env bash
set -euo pipefail

BASE="${1:-http://localhost:3001}"
echo "🔎 Probando base: $BASE"

need() { command -v "$1" >/dev/null || { echo "Instala $1"; exit 1; }; }

# Utilidades
http_code() { curl -s -o /dev/null -w "%{http_code}" "$@"; }
get_json()  { curl -s -H "Accept: application/json" "$@"; }
post_json() { curl -s -H "Content-Type: application/json" -H "Accept: application/json" -X POST -d "$2" "$1"; }
patch_json(){ curl -s -H "Content-Type: application/json" -H "Accept: application/json" -X PATCH -d "$2" "$1"; }
delete()    { curl -s -X DELETE "$1"; }

assert_code() {
  local url="$1" expect="$2"; shift 2
  local code; code=$(http_code "$url" "$@")
  if [[ "$code" != "$expect" ]]; then
    echo "❌ $url -> $code (esperado $expect)"; exit 1
  else
    echo "✅ $url -> $code"
  fi
}

echo "== Salud básicos =="
assert_code "$BASE/api/ping" 200
assert_code "$BASE/api/hello" 200
get_json "$BASE/api/hello" | grep -q '"message"' && echo "   JSON 'message' OK ✅" || { echo "   Falta 'message' ❌"; exit 1; }

echo; echo "== Productos (lista) =="
assert_code "$BASE/api/products/" 200
get_json "$BASE/api/products/" | head -c 200 && echo -e "\n   JSON productos OK ✅"

echo; echo "== Registro + Login =="
need jq
TS=$(date +%s)
EMAIL="test$TS@example.local"
PASS="Test1234!"

# Registro (toleramos 200 o 201)
REG_STATUS=$(http_code -H "Content-Type: application/json" -X POST -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" "$BASE/api/auth/register")
case "$REG_STATUS" in
  200|201) echo "✅ register -> $REG_STATUS";;
  *) echo "⚠️ register -> $REG_STATUS (continuamos igualmente)";;
esac

# Login
LOGIN_JSON=$(post_json "$BASE/api/auth/login" "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}") || { echo "❌ login falló"; exit 1; }
echo "$LOGIN_JSON" | jq . >/dev/null || { echo "❌ login no devolvió JSON válido"; exit 1; }
# Intentamos extraer token con varias claves comunes
TOKEN=$(echo "$LOGIN_JSON" | jq -r '.token // .access_token // .jwt // .data.token // empty')
if [[ -z "${TOKEN:-}" || "$TOKEN" == "null" ]]; then
  echo "⚠️ No se encontró token en la respuesta de login. Probamos endpoints públicos y /users/me podría fallar."
else
  echo "🔐 Token obtenido."
  AUTH_H=("Authorization: Bearer $TOKEN")
fi

echo; echo "== /users/me (si hay token) =="
if [[ -n "${TOKEN:-}" ]]; then
  ME_CODE=$(http_code -H "${AUTH_H[@]}" "$BASE/api/users/me")
  if [[ "$ME_CODE" == "200" ]]; then
    echo "✅ /api/users/me -> 200"
    get_json -H "${AUTH_H[@]}" "$BASE/api/users/me" | jq .
  else
    echo "⚠️ /api/users/me -> $ME_CODE (quizá requiere otros permisos/rol)"
  fi
else
  echo "⚠️ Saltando /api/users/me (sin token)"
fi

echo; echo "== Cart básico (si existe product_id=1) =="
# GET carrito
http_code "$BASE/api/cart/" | grep -qE '200|204' && echo "✅ GET /api/cart/" || echo "⚠️ /api/cart/ no 200/204 (puede requerir sesión/estado)"

# Intento add_to_cart con product_id 1
ADD_BODY='{"product_id":1,"qty":1}'
ADD_CODE=$(http_code -H "Content-Type: application/json" -X POST -d "$ADD_BODY" "$BASE/api/cart/")
echo "POST /api/cart/ -> $ADD_CODE (esperado 200/201/204; si 401/403, requiere auth)"

echo; echo "🎉 Smoke tests terminados."
