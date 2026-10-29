# ==============================================================================
# Multi-stage Dockerfile para SISTEMA ERP (Gateway & Plataforma Unificada)
# Optimizado para Google Cloud Run y Cloud Build
# ==============================================================================

# ------------------------------------------------------------------------------
# Etapa 1: Compilación de la aplicación Frontend (Vite + React + Tailwind)
# ------------------------------------------------------------------------------
FROM node:20-slim AS frontend-builder
WORKDIR /app

# Instalar dependencias
COPY package.json package-lock.json ./
RUN npm ci

# Copiar código fuente y compilar bundle de producción
COPY tsconfig.json vite.config.ts tailwind.config.js postcss.config.js index.html ./
COPY public/ ./public/
COPY src/ ./src/
RUN npm run build

# ------------------------------------------------------------------------------
# Etapa 2: Servidor de Producción Backend (FastAPI + Uvicorn)
# ------------------------------------------------------------------------------
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080

WORKDIR /app

# Instalar dependencias del sistema y zona horaria
RUN apt-get update && apt-get install -y --no-install-recommends \
    tzdata \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar aplicación backend y módulos de seguridad
COPY main.py security_service.py ./

# Copiar el build compilado de la Etapa 1 (Frontend SPA)
COPY --from=frontend-builder /app/dist ./dist

# Crear usuario seguro sin privilegios (SonarCloud S6585)
RUN groupadd -r erpuser && useradd -r -g erpuser -m -d /home/erpuser erpuser \
    && chown -R erpuser:erpuser /app

USER erpuser

# Puerto esperado por Cloud Run (por defecto 8080)
EXPOSE 8080

# Chequeo de salud del contenedor (SonarCloud S6589)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8080}/api/health || exit 1

# Comando de arranque para Cloud Run
CMD ["sh", "-c", "exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]
