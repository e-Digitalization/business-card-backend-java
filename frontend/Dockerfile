FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
RUN npm run build

FROM nginx:1.27-alpine
RUN apk add --no-cache bash
COPY docker/nginx.http.conf /etc/nginx/templates/http.conf
COPY docker/nginx.ssl.conf /etc/nginx/templates/ssl.conf
COPY docker/entrypoint.sh /docker-entrypoint.d/50-select-conf.sh
RUN chmod +x /docker-entrypoint.d/50-select-conf.sh
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80 443
