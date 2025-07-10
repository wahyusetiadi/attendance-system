# Step 1: Build stage
FROM node:18-alpine AS builder

# Install esbuild secara global
RUN npm install -g esbuild

WORKDIR /app

# Salin file konfigurasi dan install dependencies
COPY package*.json ./
RUN npm install

# Salin seluruh kode sumber
COPY . .

# Transpile next.config.ts → next.config.js (karena Next hanya baca JS di runtime)
RUN esbuild next.config.ts --outfile=next.config.js --platform=node --target=es2017

# Build Next.js app
RUN npm run build

# Step 2: Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Copy file hasil build dan konfigurasi yang dibutuhkan
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js

# Jalankan aplikasi
CMD ["npm", "start"]
