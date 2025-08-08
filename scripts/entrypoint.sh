#!/usr/bin/env sh
set -e

# ---------------------------------------------------------------------------
# 1. Download model if not present
# ---------------------------------------------------------------------------
if [ ! -f "$MODEL_PATH" ]; then
  echo "[entrypoint] Model not found - downloading GGUF…"
  mkdir -p "$(dirname "$MODEL_PATH")"


  curl -L -H "Authorization: Bearer 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" \
       https://huggingface.co/TheBloke/phi-2-GGUF/resolve/main/phi-2.Q4_0.gguf \
       --output "$MODEL_PATH"
  echo "[entrypoint] Download complete."
fi


# ---------------------------------------------------------------------------
# 2. Launch the API
# ---------------------------------------------------------------------------
exec node dist/index.js
