FROM node:20-bullseye-slim

RUN apt-get update && apt-get install -y curl unzip

RUN curl -fsSL https://bun.sh/install | bash \
  && mv /root/.bun/bin/bun /usr/local/bin/bun

WORKDIR /app

COPY package.json /app
COPY bun.lockb /app
COPY tsconfig.json /app

RUN bun install

COPY . /app

CMD ["bun", "run", "start"]