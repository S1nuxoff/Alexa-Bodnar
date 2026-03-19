#!/bin/sh
# If the uploads volume is empty, seed it with images baked into the image
if [ -z "$(ls -A /app/uploads 2>/dev/null)" ]; then
  echo "Seeding uploads from image..."
  cp -r /app/uploads_seed/. /app/uploads/
  echo "Seed complete."
fi

exec uvicorn app.main:app --host 0.0.0.0 --port 8000
