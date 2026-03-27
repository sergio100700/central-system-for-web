#!/bin/sh
# wait-for-backend.sh
set -e
host="$1"
shift

until nc -z "$host" 3001; do
  echo "Waiting for backend at $host:3001..."
  sleep 1
done

exec "$@"