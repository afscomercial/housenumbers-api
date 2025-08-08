# syntax=docker/dockerfile:1
FROM node:20-slim

WORKDIR /app

# Create non-root user and data directory
RUN useradd --system --uid 1001 nodejs \
    && mkdir -p /app/data \
    && chown -R nodejs:nodejs /app

# Copy package files and install dependencies
COPY package*.json tsconfig.json ./
RUN npm ci

# Copy source & build
COPY src ./src
RUN npm run build

# Switch to non-root user
USER nodejs

# Set environment variables (no model-related env vars)
ENV NODE_ENV=production \
    AUTH_PASSWORD=password \
    AUTH_USERNAME=admin \
    JWT_SECRET=dsujn324daw \
    JWT_EXPIRES_IN=24h

EXPOSE 3000
CMD ["node", "dist/index.js"]