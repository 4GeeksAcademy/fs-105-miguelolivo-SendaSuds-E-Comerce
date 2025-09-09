#!/usr/bin/env bash
set -euo pipefail
BASE="${1:-http://localhost:3001}"
echo "🔎 Base: $BASE"

need() { command -v "$1" >/dev/null || { echo "Instala $1"; exit 1; }; }
need jq

http()  { curl -sS -o /dev/null -w "%{http_code}" "$@"; }
getj()  { curl -sS -H "Accept: application/json" "$@"; }
postj(){ curl -sS -H "Content-Type: application/json" -H "Accept: application/json" -X POST -d "$2" "$1"; }
patchj(){ curl -sS -H "Content-Type: application/json" -H "Accept: application/json" -X PATCH -d "$2" "$1"; }
del()   { curl -sS -X DELETE "$1"; }

must(){
  local url="$1" expect="$2"; shift 2 || true
  local code; code=$(http "$url" "$@")
  [[ "$code" == "$expect" ]] && echo "✅ $url -> $code" || { echo "❌ $url -> $code (esperado $expect)"; exit 1; }
}

echo "== Salud =="
must "$BASE/api/ping" 200
must "$BASE/api/hello" 200
getj "$BASE/api/hello" | jq -e '.message' >/dev/null && echo "   JSON hello OK ✅"

echo; echo "== Productos =="
must "$BASE/api/products/" 200
LIST=$(getj "$BASE/api/products/")
echo "$LIST" | jq -r '.results[0].id // .[0].id // 1' >/dev/null 2>&1 || true
PID=$(echo "$LIST" | jq -r '.results[0].id // .[0].id // 1')
echo "   Primer product_id: ${PID:-1}"
must "$BASE/api/products/$PID" 200

echo; echo "== Auth =="
TS=$(date +%s); EMAIL="test${TS}@example.local"; PASS="Test1234!"
REG_CODE=$(http -H "Content-Type: application/json" -X POST -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" "$BASE/api/auth/register")
echo "   register -> $REG_CODE (ok si 200/201/409)"
LOGIN_JSON=$(postj "$BASE/api/auth/login" "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")
TOKEN=$(echo "$LOGIN_JSON" | jq -r '.token // .access_token // .jwt // .data.token // empty')
[[ -n "$TOKEN" && "$TOKEN" != "null" ]] && echo "🔐 Token OK" || echo "⚠️ Sin token; /users/* puede fallar"
AUTH=(-H "Authorization: Bearer $TOKEN")

echo; echo "== Users =="
if [[ -n "${TOKEN:-}" && "$TOKEN" != "null" ]]; then
  must "$BASE/api/users/me" 200 "${AUTH[@]}"
  getj "$BASE/api/users/me" "${AUTH[@]}" | jq .
  # Update name
  CODE=$(http "${AUTH[@]}" -H "Content-Type: application/json" -X PATCH -d '{"name":"Smoke Tester"}' "$BASE/api/users/me")
  echo "   PATCH /users/me -> $CODE (esperado 200/204)"
else
  echo "   (saltando users/* por falta de token)"
fi

echo; echo "== Cart =="
must "$BASE/api/cart/" 200
# add_to_cart
CODE=$(http -H "Content-Type: application/json" -X POST -d "{\"product_id\":$PID,\"qty\":1}" "$BASE/api/cart/")
echo "   POST /cart/ -> $CODE (200/201/204 ok; 401/403 si requiere auth)"
# set_qty
CODE=$(http -H "Content-Type: application/json" -X PATCH -d '{"qty":2}' "$BASE/api/cart/$PID")
echo "   PATCH /cart/$PID -> $CODE (200/204 ok)"
# remove_item
CODE=$(http -X DELETE "$BASE/api/cart/$PID")
echo "   DELETE /cart/$PID -> $CODE (200/204 ok)"
# clear_cart
CODE=$(http -X POST "$BASE/api/cart/clear")
echo "   POST /cart/clear -> $CODE (200/204 ok)"

echo; echo "== Checkout (puede requerir payload específico) =="
CODE=$(http -H "Content-Type: application/json" -X POST -d '{}' "$BASE/api/checkout/create")
echo "   POST /checkout/create -> $CODE (ok si 200/201; 400 si faltan datos)"
CODE=$(http -H "Content-Type: application/json" -X POST -d '{}' "$BASE/api/checkout/confirm")
echo "   POST /checkout/confirm -> $CODE (ok si 200/201; 400 si faltan datos)"

echo; echo "== Admin de productos (esperable 401/403 sin rol) =="
CODE=$(http -H "Content-Type: application/json" -X POST -d '{"name":"Tmp","price":9.99}' "$BASE/api/products/")
echo "   POST /api/products/ -> $CODE (401/403 esperado si no admin)"
CODE=$(http -H "Content-Type: application/json" -X PATCH -d '{"price":7.99}' "$BASE/api/products/$PID")
echo "   PATCH /api/products/$PID -> $CODE (401/403 esperado si no admin)"
CODE=$(http -X DELETE "$BASE/api/products/$PID")
echo "   DELETE /api/products/$PID -> $CODE (401/403 esperado si no admin)"

echo; echo "== CORS preflight (frontend dev) =="
curl -sS -I -X OPTIONS "$BASE/api/hello" \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" | grep -E 'Access-Control-Allow-Origin|HTTP/|Allow' || true

echo; echo "🎉 Smoke extendido terminado."
