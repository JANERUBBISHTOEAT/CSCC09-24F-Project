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

```sh
docker build -t zheyuanwei/w2w .
docker run --rm -p 3000:3000 --network="host" zheyuanwei/w2w
```

```sh
docker stop $(docker ps -aq)
```

### DIY

If you're familiar with deploying node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `remix build`

- `build/server`
- `build/client`
