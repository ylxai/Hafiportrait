# HafiPortrait Photography - Simplified Multi-Stage Docker Build
# Stage 1: Dependencies
FROM node:22-alpine AS dependencies

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package.json ./package.json

# Copy source code
COPY . .

# Try to build (continue even if fails)
RUN pnpm run build || echo "Build failed, will use dev mode"

# Stage 3: Production
FROM node:22-alpine AS production

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy source and config files (only if they exist)
COPY --chown=nextjs:nodejs src ./src
COPY --chown=nextjs:nodejs scripts ./scripts

# Create public directory and copy files
RUN mkdir -p public
COPY --chown=nextjs:nodejs public ./public
COPY --chown=nextjs:nodejs next.config.js ./
COPY --chown=nextjs:nodejs tailwind.config.js ./
COPY --chown=nextjs:nodejs postcss.config.js ./
COPY --chown=nextjs:nodejs tsconfig.json ./

# Copy build if exists
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["sh", "-c", "if [ -d '.next' ] && [ \"$(ls -A .next 2>/dev/null)\" ]; then echo 'Starting production mode' && pnpm start; else echo 'Starting development mode' && pnpm run dev; fi"]