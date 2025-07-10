# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source code
COPY frontend/ ./

# Build frontend for production
RUN npm run build

# Stage 2: Backend + Frontend Estático
FROM node:18-alpine AS production

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install backend production dependencies
RUN npm ci --only=production

# Copy backend source code
COPY backend/ ./

# Copy frontend build from stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port 3002 (conforme configuração atual)
EXPOSE 3002

# Start the unified application
CMD ["npm", "run", "dev"]

