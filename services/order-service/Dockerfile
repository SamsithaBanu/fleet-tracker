FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

# Create uploads folder for proof of delivery photos
RUN mkdir -p uploads

COPY . .

EXPOSE 3012

CMD ["node", "src/server.js"]