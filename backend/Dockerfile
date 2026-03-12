# Build stage
FROM node:20 AS builder

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy source and config files
COPY tsconfig.json ./
COPY prisma ./prisma/
COPY src ./src/

# Generate Prisma client and build TypeScript
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20

WORKDIR /app

# Create a non-root user (Debian style)
RUN groupadd -r nodejs && useradd -r -g nodejs nextjs

# Copy only necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Use non-root user
USER nextjs

EXPOSE 5000

CMD ["npm", "start"]
