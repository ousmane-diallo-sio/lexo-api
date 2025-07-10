FROM node:20-bullseye-slim

# Install required packages including xz-utils for tar.xz extraction
RUN apt-get update && apt-get install -y curl unzip wget xz-utils

# Install architecture-specific watchexec binary
RUN arch=$(uname -m) && \
    if [ "$arch" = "aarch64" ] || [ "$arch" = "arm64" ]; then \
        WATCHEXEC_URL="https://github.com/watchexec/watchexec/releases/download/v1.22.3/watchexec-1.22.3-aarch64-unknown-linux-gnu.tar.xz"; \
        WATCHEXEC_DIR="watchexec-1.22.3-aarch64-unknown-linux-gnu"; \
    else \
        WATCHEXEC_URL="https://github.com/watchexec/watchexec/releases/download/v1.22.3/watchexec-1.22.3-x86_64-unknown-linux-gnu.tar.xz"; \
        WATCHEXEC_DIR="watchexec-1.22.3-x86_64-unknown-linux-gnu"; \
    fi && \
    wget $WATCHEXEC_URL && \
    tar -xf $(basename $WATCHEXEC_URL) && \
    cp $WATCHEXEC_DIR/watchexec /usr/local/bin/ && \
    chmod +x /usr/local/bin/watchexec && \
    rm -rf $(basename $WATCHEXEC_URL) $WATCHEXEC_DIR

# Install bun
RUN curl -fsSL https://bun.sh/install | bash \
  && mv /root/.bun/bin/bun /usr/local/bin/bun

WORKDIR /app
ENV NODE_ENV=dev

COPY package.json /app
COPY bun.lockb /app
COPY tsconfig.json /app

RUN bun install

# Create dist directory
RUN mkdir -p /app/dist

# Start development with watchexec
CMD ["bun", "run", "dev"]