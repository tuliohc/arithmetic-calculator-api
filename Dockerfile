FROM node:lts-alpine

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Build the application
RUN npm run build

# Expose port 3000 for the server
EXPOSE 3000

# Start the server
CMD [ "npm", "start" ]