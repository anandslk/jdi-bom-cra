# Use official Node.js 22 Alpine image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Enable and activate pnpm using corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy only package.json first (for better Docker cache layering)
COPY package.json ./

# Install dependencies without a lockfile
RUN pnpm install --no-lockfile

# Copy the rest of the app source
COPY . .

# Build the application
RUN pnpm run build

# Expose application port
EXPOSE 3000

# Start the application
CMD ["pnpm", "run", "start"]
