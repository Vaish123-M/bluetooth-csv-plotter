FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend ./
RUN npm run build

FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend backend
COPY --from=frontend-build /app/frontend/build frontend/build

WORKDIR /app/backend

ENV PYTHONUNBUFFERED=1
ENV PORT=5000

CMD ["sh", "-c", "gunicorn -b 0.0.0.0:${PORT:-5000} app:app"]
