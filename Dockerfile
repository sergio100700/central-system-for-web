FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
WORKDIR /app

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY wait-for-back.sh /wait-for-back.sh
RUN chmod +x /wait-for-back.sh
EXPOSE 80
CMD ["/wait-for-back.sh", "backend", "nginx", "-g", "daemon off;"]