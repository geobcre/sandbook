# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files from the backend directory
COPY backend/package*.json ./

# Install dependencies (without running postinstall scripts)
RUN npm ci --ignore-scripts

# Copy backend source code
COPY backend/ ./

# Generate Prisma client (now that schema is available)
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]