# ---------- build stage ----------
FROM node:22-bookworm-slim AS build

WORKDIR /web

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_API_BASE_URL
RUN npm run security:audit && npm run build

# ---------- runtime stage ----------
FROM nginx:1.27-alpine AS runner

COPY --from=build /web/dist /usr/share/nginx/html
COPY --from=build /web/reports/browser-bundle-exposure.json /usr/local/share/quickfe-evidence/browser-bundle-exposure.json
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY certs /etc/nginx/certs

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
