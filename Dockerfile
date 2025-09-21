
# Use an official Node.js runtime as a parent image
FROM node:22-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./

# Install any needed packages
RUN yarn install

# Bundle app source
COPY . .

# Make port 80 available to the world outside this container
EXPOSE 80

# Define the command to run the app
CMD ["yarn", "start"]
