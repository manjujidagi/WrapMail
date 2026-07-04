# Use a small official Node runtime as a parent image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency descriptors
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy application code
COPY . .

# Expose port and define default command
EXPOSE 3000
CMD ["npm", "start"]
