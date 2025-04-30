# Build stage
FROM node:18-alpine AS builder

# Set environment variables
ENV NODE_ENV=production
ENV CI=false

WORKDIR /app

# First copy only package files for better layer caching
COPY package.json package-lock.json ./

# Clean install with frozen lockfile and exact versions
RUN npm ci --legacy-peer-deps --no-audit

# Copy all other files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:1.25-alpine

# Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx/nginx.conf /etc/nginx/conf.d

# Copy built assets from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port and run nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]