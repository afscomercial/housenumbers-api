# Use Node.js 22 Alpine as base image
FROM node:22-alpine as builder

# Set working directory
WORKDIR /app

# Install system dependencies required for native modules
RUN apk add --no-cache python3 make g++ cmake

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci && npm cache clean --force

# Copy source code
COPY src ./src

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine

# Install system dependencies for runtime
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cmake \
    && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder /app/dist ./dist

# Copy ESM subprocess script
COPY src/infrastructure/llm/llama-subprocess.mjs ./dist/infrastructure/llm/

# Copy model file if it exists
COPY src/models/ ./models/ 2>/dev/null || echo "No models directory found"

# Create directories for data and models
RUN mkdir -p data models && \
    chown -R nodejs:nodejs /app

# Copy model placeholder (model will be downloaded separately)
# Note: The actual model file should be downloaded from HuggingFace
# and placed in the models directory before building the image

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=./data/database.sqlite
ENV MODEL_PATH=./models/llama-2-7b-chat.Q4_K_S.gguf

# Expose port
EXPOSE 3000

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/index.js"]