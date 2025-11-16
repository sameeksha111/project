FROM node:24-alpine

# Create app directory
WORKDIR /usr/src/app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

ENV NODE_ENV=production
EXPOSE 5000

# Start the server
CMD ["node", "simple-server.js"]
