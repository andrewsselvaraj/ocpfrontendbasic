# Build stage: Red Hat UBI Node.js 24 image
FROM registry.access.redhat.com/ubi9/nodejs-24:latest AS build
USER root
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# Runtime stage: UBI nginx listens on 8080 and runs as OpenShift's arbitrary
# non-root UID (restricted-v2 SCC).
FROM registry.access.redhat.com/ubi9/nginx-124:latest
# Extra location blocks for the default server: proxies /api to the backend Service
COPY nginx/api-proxy.conf ${NGINX_DEFAULT_CONF_PATH}/
COPY --from=build /build/dist/loan-management-frontend/browser/ /opt/app-root/src/
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
