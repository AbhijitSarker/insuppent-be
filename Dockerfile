# Build stage
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy rest of the application
COPY . .

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files and built files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src

# Set NODE_ENV
ENV NODE_ENV=production

# Expose port 5000
EXPOSE 5000

# Start the application
CMD ["node", "src/server.js"]
