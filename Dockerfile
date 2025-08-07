# Use Node.js 20 LTS for better compatibility
FROM node:20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 nodejs

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies and build
RUN npm ci && npm cache clean --force

# Copy source code and build
COPY src ./src
RUN npm run build

# Copy ESM subprocess script to the correct location
COPY src/infrastructure/llm/llama-subprocess.mjs ./dist/infrastructure/llm/

# Copy model file if it exists
COPY src/models/ ./models/

# Create directories and set permissions
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