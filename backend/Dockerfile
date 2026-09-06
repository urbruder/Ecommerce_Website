FROM node:26-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 4000
CMD ["node","server.js"]
