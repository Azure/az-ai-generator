# Triggers backend API using curl
# Helpful when testing locally

curl "http://localhost:8000/blog" \
-X POST \
-H "Content-Type: application/json" \
-d '{ "topic": "cookies"}'