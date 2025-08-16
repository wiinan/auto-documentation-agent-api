FROM node:24-alpine

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    libc6 \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Imagem final (produção)
FROM node:24-alpine

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libc6 \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main"]
