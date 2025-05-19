const EnvConfig = {
  HOST: process.env.HOST ?? "127.0.0.1",
  PORT: process.env.PORT ?? 3005,
  MIKRO_ORM_DB_HOST: process.env.MIKRO_ORM_DB_HOST ?? "missing db host",
  MIKRO_ORM_DB_NAME: process.env.MIKRO_ORM_DB_NAME ?? "randomdb",
  MIKRO_ORM_DB_USER: process.env.MIKRO_ORM_DB_USER ?? "user",
  MIKRO_ORM_DB_PASSWORD: process.env.MIKRO_ORM_DB_PASSWORD ?? "password",
  MIKRO_ORM_DB_PORT: parseInt(process.env.MIKRO_ORM_DB_PORT ?? '0'),
  JWT_SECRET: process.env.JWT_SECRET ?? "azerty",
  DOCKERHUB_USERNAME: process.env.DOCKERHUB_USERNAME ?? "missing dockerhub username",
  DOCKERHUB_TOKEN: process.env.DOCKERHUB_TOKEN ?? "missing dockerhub token",
  DOCKERHUB_CONTAINER_NAME: process.env.DOCKERHUB_CONTAINER_NAME ?? "missing dockerhub container name",
  DOCKERHUB_WEBHOOK_TOKEN: process.env.DOCKERHUB_WEBHOOK_TOKEN ?? "missing dockerhub webhook token",
  API_BASE_URL: process.env.API_BASE_URL ?? "missing api base url",
}

export default EnvConfig;