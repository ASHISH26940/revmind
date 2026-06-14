FROM oven/bun:1 AS build
WORKDIR /app
COPY frontend/package.json frontend/bun.lock ./
RUN bun install
COPY frontend/ .
RUN bun run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
