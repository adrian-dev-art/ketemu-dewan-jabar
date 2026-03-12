# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy source and config files
COPY . .

# Pass build-time environment variables
ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

ARG NEXT_PUBLIC_STUN_SERVERS
ENV NEXT_PUBLIC_STUN_SERVERS=$NEXT_PUBLIC_STUN_SERVERS

ARG NEXT_PUBLIC_TURN_SERVERS
ENV NEXT_PUBLIC_TURN_SERVERS=$NEXT_PUBLIC_TURN_SERVERS

ARG NEXT_PUBLIC_TURN_USERNAME
ENV NEXT_PUBLIC_TURN_USERNAME=$NEXT_PUBLIC_TURN_USERNAME

ARG NEXT_PUBLIC_TURN_PASSWORD
ENV NEXT_PUBLIC_TURN_PASSWORD=$NEXT_PUBLIC_TURN_PASSWORD

# Build Next.js
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

# Create a non-root user
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy standalone build and static files
# COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Use non-root user
USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
