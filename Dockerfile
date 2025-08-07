# syntax=docker/dockerfile:1
FROM node:20-slim

# --------- basic build deps for node-llama-cpp native addon + curl ----------
RUN apt-get update && \
    apt-get install -y python3 make g++ curl && \
    rm -rf /var/lib/apt/lists/*

# --------- app source ----------
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci --omit=dev

COPY src ./src
RUN npm run build         # outputs to dist/

# --------- runtime downloader entrypoint ----------
COPY scripts/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# --------- non-root user ----------
RUN useradd --system --uid 1001 nodejs \
&& mkdir -p /app/models /app/data \
 && chown -R nodejs:nodejs /app  

USER nodejs

# --------- default envs (override in Railway Variables) ----------
ENV NODE_ENV=production \
    PORT=3000 \
    MODEL_PATH=/app/models/llama-2-7b-chat.Q4_K_S.gguf \
    MODEL_CONTEXT_SIZE=2048 \
    MODEL_GPU_LAYERS=0

EXPOSE 3000
CMD ["/app/entrypoint.sh"]
