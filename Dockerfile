# Multi-stage Dockerfile for Agri-Acoustic Sentinel
# Builds both Node.js backend and Python ImageBind environment

# Stage 1: Python environment with ImageBind
FROM python:3.10-slim as python-builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Clone ImageBind repository
RUN git clone https://github.com/facebookresearch/ImageBind.git /app/ImageBind || echo "ImageBind may already exist"

WORKDIR /app/ImageBind

# Install Python dependencies
RUN pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir . && \
    pip install --no-cache-dir soundfile

# Stage 2: Node.js backend
FROM node:18-slim

WORKDIR /app

# Install system dependencies for Node.js
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    git \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy Python environment from builder
COPY --from=python-builder /app/ImageBind /app/ImageBind

# Copy server files
COPY server/package*.json ./server/
COPY server/*.js ./server/
COPY server/*.py ./server/
COPY server/*.md ./server/
COPY server/*.bat ./server/
COPY server/*.sh ./server/

# Install Node.js dependencies
WORKDIR /app/server
RUN npm install

# Copy client files (if building for production)
COPY client/package*.json ../client/
COPY client/ ../client/

WORKDIR /app/client
RUN npm install && npm run build

# Set working directory back to server
WORKDIR /app/server

# Expose port
EXPOSE 5000

# Environment variables
ENV NODE_ENV=production
ENV PYTHONUNBUFFERED=1

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "index.js"]

