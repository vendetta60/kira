# Build (layihə kökündən): docker build -f backend/Dockerfile .
# Run: docker run --env-file backend/.env -p 8001:8001 <image>

FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl gnupg unixodbc unixodbc-dev \
    && curl -fsSL https://packages.microsoft.com/keys/microsoft.asc \
    | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft-prod.gpg] https://packages.microsoft.com/debian/12/prod bookworm main" \
    > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y --no-install-recommends msodbcsql18 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt /app/requirements.txt
RUN pip install --upgrade pip && pip install -r /app/requirements.txt

COPY backend /app/backend

ENV PYTHONPATH=/app

EXPOSE 8001

# Konteynerdə ENV (compose env_file) — UVICORN_* optional
CMD ["sh", "-c", "exec python -m uvicorn backend.main:app --host ${UVICORN_HOST:-0.0.0.0} --port ${UVICORN_PORT:-8001} --workers ${UVICORN_WORKERS:-1}"]
