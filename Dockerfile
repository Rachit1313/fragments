# Dockerfile with instructions for the docker

FROM node:16.17.0-alpine as build

LABEL maintainer="Rachit Chawla <rachitchawla33@gmail.com>"
LABEL description="Fragments node.js microservice"

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Option 1: explicit path - Copy the package.json and package-lock.json
# files into /app. NOTE: the trailing `/` on `/app/`, which tells Docker
# that `app` is a directory and not a file.
COPY package*.json /app/

# Install node dependencies defined in package-lock.json
RUN npm install

# Copy src to /app/src/
COPY ./src ./src

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

FROM node:16.17.0-alpine

# Setting working directory to app
WORKDIR /app

# Copying contents of app from build stage
COPY --from=build /app /app

# Set NODE_ENV to production
ENV NODE_ENV=production
# Setup user node instead of root
USER node

# Start the container by running our server
CMD ["npm", "start"]

# We run our service on port 8080
EXPOSE 8080
