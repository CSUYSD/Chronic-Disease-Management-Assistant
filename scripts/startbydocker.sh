
# entry docker directory
cd ../docker

# create nginx/ssl directory
mkdir -p nginx/ssl

# generate self-signed SSL certificate (for development)
echo "Generating self-signed SSL certificate for development..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/private.key \
    -out nginx/ssl/certificate.crt \
    -subj "/C=US/ST=State/L=City/O=Development/CN=localhost"

# start Redis Stack
echo "Starting Redis Stack..."
docker run -d --name redis-stack --restart=always \
    -v redis-data:/data \
    -p 6380:6379 -p 8001:8001 \
    -e REDIS_ARGS="--requirepass 123456" \
    redis/redis-stack:latest

# wait for Redis Stack to start
echo "Waiting for Redis Stack to start..."
sleep 10

# start other services
echo "Starting other services..."
docker-compose up -d

echo "Deployment completed!"