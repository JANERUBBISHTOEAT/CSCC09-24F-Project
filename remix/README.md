# Welcome to Remix

- [Remix Docs](https://remix.run/docs)

## Development

From your terminal:

```sh
redis-server .\app\redis.windows.conf
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

Local: build docker image the push to docker hub

```sh
# amd64
docker build -t zheyuanwei/w2w .
docker push zheyuanwei/w2w

# arm64 to amd64
docker buildx build --platform=linux/amd64 -t zheyuanwei/w2w:latest --push .

# docker run --rm -p 3000:3000 --network="host" --pull=always zheyuanwei/w2w
```

Remote: run docker-compose

```sh
docker-compose down
docker-compose pull
docker-compose up -d
```

Clean up:

```sh
docker rmi -f $(docker images -q)
docker image prune -a
y
docker system prune -a --volumes
y
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
```

HTTPS (necessary for WebCrypto API, which is necessary for WebTorrent):

```sh
openssl req -x509 -nodes -newkey rsa:4096 -keyout server.key -out server.crt
```

### DIY

If you're familiar with deploying node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `remix build`

- `build/server`
- `build/client`
