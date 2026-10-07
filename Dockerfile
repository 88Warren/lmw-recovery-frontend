# Multi-stage build — node builds the app, nginx serves it
# Multi-arch compatible — builds for linux/amd64 and linux/arm64
#
# docker buildx build \
#   --platform linux/amd64,linux/arm64 \
#   -t lmwcode/lmw-recovery-frontend:v1.0.0 \
#   --no-cache --push .
#
# Production env vars are read from .env.production at build time by Vite.
# Make sure .env.production is populated before building.

# ── Stage 1: build ────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
# Vite picks up .env.production automatically — no --build-arg needed
COPY . .
RUN npm run build

# ── Stage 2: serve ────────────────────────────────────────────
FROM nginx:1.27-alpine

# Remove default nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA-aware nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost/ || exit 1
