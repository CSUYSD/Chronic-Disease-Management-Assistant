Docker service setup
```shell
:docker run -d --name redis-stack --restart=always  -v redis-data:/data -p 6380:6379 -p 8001:8001 -e REDIS_ARGS="--requirepass 123456" redis/redis-stack:latest
