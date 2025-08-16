# Multi-stage build untuk WebSocket service
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Production stage
FROM node:18-alpine AS production

# Install dumb-init untuk proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S websocket -u 1001

# Set working directory
WORKDIR /app

# Copy dependencies from builder stage
COPY --from=builder --chown=websocket:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=websocket:nodejs . .

# Create directories for logs and status files
RUN mkdir -p logs status && chown -R websocket:nodejs logs status

# Create status files
RUN echo '{"status": "disconnected", "lastHeartbeat": null}' > status/dslr-status.json
RUN echo '[]' > status/backup-status.json
RUN chown websocket:nodejs status/*.json

# Switch to non-root user
USER websocket

# Expose ports
EXPOSE 3001 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node health-check.js || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]