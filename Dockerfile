# Multi-stage Dockerfile for Next.js App optimized for GCP

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_API_BASE_URL_API
ARG NEXT_PUBLIC_API_AUTH_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Allow passing NEXT_PUBLIC_* vars at build-time so Next.js inlines them into client bundles
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_API_BASE_URL_API=${NEXT_PUBLIC_API_BASE_URL_API}
ENV NEXT_PUBLIC_API_AUTH_URL=${NEXT_PUBLIC_API_AUTH_URL}

# Build the Next.js application
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port (Cloud Run uses PORT env variable, defaulting to 3000)
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]
