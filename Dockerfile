# This will build the necessary webgme needed for plugin execution.
# Note! If you have any other dependencies (in addition to node-modules) make sure to
# add the neccessary steps to bundle these within the image.
#
# 1. Copy this file to the root of your webgme repository (a clean copy, no node_modules, blobstorage etc.)
# 2. Build the image
#     $ docker build -t webgme-om-worker .

# https://github.com/nodejs/docker-node/blob/25f26146ac5b9f74add731b0b078e34411ae5831/8/Dockerfile
FROM node:carbon

RUN mkdir /usr/app

WORKDIR /usr/app

# copy app source
ADD . /usr/app/

# Install the node-modules.
RUN npm install

# Uncomment this line if webgme-docker-worker-manager is a node_module
RUN cp /usr/app/node_modules/webgme-docker-worker-manager/dockerworker.js /usr/app/dockerworker.js

# Make sure to set this correctly here
ENV NODE_ENV dockerworker

# Installing OpenModelica https://openmodelica.org/download/download-linux

RUN for deb in deb deb-src; do echo "$deb http://build.openmodelica.org/apt jessie release"; done | tee /etc/apt/sources.list.d/openmodelica.list

# You will also need to import the GPG key used to sign the releases:
RUN wget -q http://build.openmodelica.org/apt/openmodelica.asc -O- | apt-key add -

# Then update and install OpenModelica
RUN apt-get update
RUN apt-get --assume-yes install openmodelica

# Installs optional Modelica libraries (most have not been tested with OpenModelica)
# RUN sudo apt --assume-yes install omlib-.*
