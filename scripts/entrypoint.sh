#!/usr/bin/env sh
set -e

# ---------------------------------------------------------------------------
# 1. Download model if not present
# ---------------------------------------------------------------------------
if [ ! -f "$MODEL_PATH" ]; then
  echo "[entrypoint] Model not found – downloading GGUF…"
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
# 2. Launch the API
# ---------------------------------------------------------------------------
exec node dist/index.js
