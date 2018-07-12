# This will build the necessary webgme needed for plugin execution.
# Note! If you have any other dependencies (in addition to node-modules) make sure to
# add the neccessary steps to bundle these within the image.
#
# 1. Copy this file to the root of your webgme repository (a clean copy, no node_modules, blobstorage etc.)
# 2. Build the image
#     $ docker build -t webgme-server .

# https://github.com/nodejs/docker-node/blob/25f26146ac5b9f74add731b0b078e34411ae5831/8/Dockerfile
FROM node:carbon
MAINTAINER Patrik Meijer <patrik.meijer@vanderbilt.edu>

RUN apt-get update \
    && apt-get install -y git

RUN mkdir /usr/app

WORKDIR /usr/app

# copy app source
ADD . /usr/app/

# Install node-modules (fixme: we should not run as sudo)
RUN npm install --unsafe-perm

CMD ["npm", "start"]
