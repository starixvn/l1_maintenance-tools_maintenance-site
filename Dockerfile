# Use Node.js LTS (Long Term Support) as the base image
FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Create .env file from example if it doesn't exist
COPY .env.example .env

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"] 