#!/usr/bin/env sh
set -e

# ---------------------------------------------------------------------------
# 1. Download model if not present
# ---------------------------------------------------------------------------
if [ ! -f "$MODEL_PATH" ]; then
  echo "[entrypoint] Model not found - downloading GGUF…"
  mkdir -p "$(dirname "$MODEL_PATH")"

  if [ -z "$HF_TOKEN" ]; then
    echo "[entrypoint] ERROR: HF_TOKEN env var is empty; cannot download model."
    exit 1
  fi

  curl -L -H "Authorization: Bearer $HF_TOKEN" \
       https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/resolve/main/llama-2-7b-chat.Q4_K_S.gguf \
       --output "$MODEL_PATH"
  echo "[entrypoint] Download complete."
fi

# ---------------------------------------------------------------------------
# 2. validate environment variables
# ---------------------------------------------------------------------------
echo "[entrypoint] JWT_SECRET present? $( [ -n "$JWT_SECRET" ] && echo yes || echo no )"
echo "[entrypoint] JWT_EXPIRES_IN present? $( [ -n "$JWT_EXPIRES_IN" ] && echo yes || echo no )"
echo "[entrypoint] AUTH_USERNAME present? $( [ -n "$AUTH_USERNAME" ] && echo yes || echo no )"
echo "[entrypoint] AUTH_PASSWORD present? $( [ -n "$AUTH_PASSWORD" ] && echo yes || echo no )"
echo "[entrypoint] DATABASE_PATH present? $( [ -n "$DATABASE_PATH" ] && echo yes || echo no )"
echo "[entrypoint] MODEL_PATH present? $( [ -n "$MODEL_PATH" ] && echo yes || echo no )"
echo "[entrypoint] MODEL_CONTEXT_SIZE present? $( [ -n "$MODEL_CONTEXT_SIZE" ] && echo yes || echo no )"
echo "[entrypoint] MODEL_GPU_LAYERS present? $( [ -n "$MODEL_GPU_LAYERS" ] && echo yes || echo no )"


# ---------------------------------------------------------------------------
# 3. Launch the API
# ---------------------------------------------------------------------------
exec node dist/index.js
