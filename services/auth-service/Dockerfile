# Use Node.js 20 lightweight image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy all source code
COPY . .

# Expose the port this service runs on
EXPOSE 3001

# Start the service
CMD ["node", "src/server.js"]