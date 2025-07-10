# Step 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Salin file package.json dan install dependencies
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts

# Install dev dependencies untuk build
RUN npm install --only=development

# Salin semua source code
COPY . .

# Build arguments
ARG NODE_ENV=production
ARG NEXT_PUBLIC_API_URL
ARG NEXT_TELEMETRY_DISABLED=1

# Environment variables untuk build
ENV NODE_ENV=$NODE_ENV
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=$NEXT_TELEMETRY_DISABLED

# Jalankan build
RUN npm run build

# Step 2: Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Buat user non-root untuk security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Salin hanya file penting untuk runtime
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.* ./

# Install hanya production dependencies
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Set ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Environment variables
ENV NODE_ENV=production

# Start aplikasi
CMD ["npm", "start"]