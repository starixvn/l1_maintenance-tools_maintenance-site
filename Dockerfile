# Use Node.js LTS (Long Term Support) as the base image
FROM hub.lumigame.com/base/node:20.9.0-alpine-24h1.1

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"] 