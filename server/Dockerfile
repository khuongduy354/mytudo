# Multi-stage build for Node.js server
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace root package files
COPY package.json package-lock.json* ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/

# Install dependencies
RUN npm install

# Copy source code
COPY shared ./shared
COPY server ./server
COPY tsconfig.json ./

# Build shared package
RUN npm run build --workspace=shared

# Build server
RUN npm run build --workspace=server

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/

# Install production dependencies only
RUN npm install --production

# Copy built files from builder
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/server/dist ./server/dist

WORKDIR /app/server

EXPOSE 3000

CMD ["npm", "start"]
