# syntax=docker/dockerfile:1
FROM node:20-slim

WORKDIR /app

# deps for node-llama-cpp native build + wget
RUN apt-get update && \
    apt-get install -y python3 make g++ wget && \
    rm -rf /var/lib/apt/lists/*

# install production deps
COPY package*.json tsconfig.json ./
RUN npm ci --omit=dev

# copy source & build
COPY src ./src
RUN npm run build

# ---------- download quantised model ----------
# change URL if you prefer a different quant
RUN mkdir -p /app/models && \
    wget -q https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/resolve/main/llama-2-7b-chat-q4_K_S.gguf \
        -O /app/models/llama-2-7b-chat.Q4_K_S.gguf

# non-root
RUN useradd --system --uid 1001 nodejs
USER nodejs

ENV NODE_ENV=production \
    PORT=3000 \
    MODEL_PATH=/app/models/llama-2-7b-chat.Q4_K_S.gguf

EXPOSE 3000
CMD ["node", "dist/index.js"]
