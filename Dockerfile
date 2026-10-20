# build stage
FROM node:14-buster-slim AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build:web

# production stage
FROM nginx:stable-alpine AS production-stage
COPY --from=build-stage /app/dist/web /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
