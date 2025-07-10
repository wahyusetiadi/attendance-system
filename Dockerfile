# Step 1: Build stage
FROM node:18-alpine AS builder

# Install esbuild untuk transpile next.config.ts
RUN npm install -g esbuild

WORKDIR /app

# Salin file package.json dan install dependencies
COPY package*.json ./
RUN npm install

# Salin semua source code
COPY . .

# Transpile next.config.ts → next.config.js (format CommonJS, sesuai yang diminta Next.js)
RUN esbuild next.config.ts \
  --outfile=next.config.js \
  --platform=node \
  --target=es2017 \
  --format=cjs

# Jalankan build dengan NODE_ENV=production
ENV NODE_ENV=production
RUN npm run build

# Step 2: Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Salin hanya file penting untuk runtime
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js

# Jalankan aplikasi (pastikan script "start" sudah ada di package.json)
CMD ["npm", "start"]
