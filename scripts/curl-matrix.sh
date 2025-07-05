set -e

test_host () {
  code=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: $1" -X $3 http://localhost:$2$4)
  echo "$1 $3 $4 → $code"
}

test_host tg.zerologsvpn.com 4000 POST /api/auth/telegram   # ≈401 или 400

test_host zerologsvpn.com    4000 POST /api/auth/telegram   # 403

test_host zerologsvpn.com    4000 POST /api/auth/login      # 401

test_host tg.zerologsvpn.com 4000 POST /api/auth/login      # 403
