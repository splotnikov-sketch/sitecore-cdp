FROM node:lts-alpine AS appbuild

WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

## stage 2
FROM node:lts-alpine
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install --only=production
COPY --from=appbuild /app/dist ./dist
COPY --from=appbuild /app/config/jwt /app/config/jwt
COPY --from=appbuild /app/node_modules/.prisma/ /app/node_modules/.prisma

ENV PORT 80

EXPOSE $PORT

CMD ["node", "-r", "ts-node/register/transpile-only", "-r", "tsconfig-paths/register", "dist/app.js"]