# Use Node.js as the base image
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the code
COPY . .

# Build the application
RUN npm run build

# Use nginx-unprivileged to serve the built application
FROM nginxinc/nginx-unprivileged:alpine

# Copy the build output to replace the default nginx contents
COPY --from=build /app/build /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 (nginx-unprivileged uses 8080 by default)
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]