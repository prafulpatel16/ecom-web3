# Stage 1: Build the React application
FROM node:14-alpine AS build

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package.json package-lock.json ./

# Use ARG to pass the environment variable during build time
ARG REACT_APP_BACKEND_SERVICE
ENV REACT_APP_BACKEND_SERVICE=$REACT_APP_BACKEND_SERVICE

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React application
RUN npm run build

# Stage 2: Serve the React application using Nginx
FROM nginx:alpine

# Remove the default Nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Copy a custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d

# Copy the built files from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
