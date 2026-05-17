FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json tsconfig.server.json ./
COPY server ./server
COPY shared ./shared

RUN npm ci --omit=dev && npm install tsx

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8787

EXPOSE 8787

CMD ["npx", "tsx", "server/index.ts"]
