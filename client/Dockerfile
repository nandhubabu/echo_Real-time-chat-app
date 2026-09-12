# Build stage: compiles React code into static files
FROM node:20-alpine AS builder
WORKDIR /app

# API URL baked into the Vite build (empty = relative "/api", which Nginx proxies)
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage: serves the static files lightweight and fast
FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist

EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]