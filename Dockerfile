# Step 1: Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Salin package.json dan lock file
COPY package*.json ./

# Install dependencies
RUN npm install

# Salin semua source code
COPY . .

# Build Next.js app (dalam mode produksi)
RUN npm run build

# Step 2: Production stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

# Copy hanya file penting dari builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

# Jalankan aplikasi
CMD ["npm", "start"]
