# ---------- build stage ----------
FROM node:22-bookworm-slim AS build

WORKDIR /web

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- runtime stage ----------
FROM nginx:1.27-alpine AS runner

COPY --from=build /web/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY certs /etc/nginx/certs

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]