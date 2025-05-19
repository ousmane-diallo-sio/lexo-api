# lexo-api

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run docker:dev
```

To initialize the database:

```bash
bun run init
```

This project was created using `bun init` in bun v1.1.26. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

Sample env file:

```env
# .env
NODE_ENV=dev
HOST=127.0.0.1
PORT=3005
MIKRO_ORM_DB_NAME=lexo-db
MIKRO_ORM_DB_USER=lexoouser
MIKRO_ORM_DB_PASSWORD=azerty
MIKRO_ORM_DB_PORT=5432
MIKRO_ORM_DB_HOST=127.0.0.1
JWT_SECRET=azerty
DOCKERHUB_USERNAME=lexo
DOCKERHUB_TOKEN=dockerhubtoken
DOCKERHUB_CONTAINER_NAME=lexo-api
DOCKERHUB_WEBHOOK_TOKEN=dockerhubwebhooktoken
API_BASE_URL=http://localhost:3005
```