# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Pass build arg for VITE API URL configuration
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Production Stage - Serve static assets via lightweight Nginx web server
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Inject custom Nginx config for client-side routing rewrites (resolving refreshes)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
