# Etapa 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Etapa 2: Producción
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app ./
RUN npm install --omit=dev
EXPOSE 8080
CMD ["npm", "start"]
