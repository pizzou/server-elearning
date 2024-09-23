# Use Node.js v14
FROM node:22.9.0
ENV NODE_ENV=production

# Set the working directory
WORKDIR /usr/src/app

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production

# Install TypeScript globally
RUN npm install -g typescript

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE 8000

ENV PORT=8000

# Command to run the application
CMD [ "node", "dist/server.js" ]
