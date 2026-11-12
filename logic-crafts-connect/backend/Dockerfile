# Dockerfile for Logic Crafts Backend
FROM node:20-alpine

WORKDIR /usr/src/app

# Install build dependencies
COPY package*.json ./
RUN npm install --production

# Copy application code
COPY . .

# Expose default port
EXPOSE 5000

# Start server
CMD ["node", "server.js"]

