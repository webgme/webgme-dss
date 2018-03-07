#!/usr/bin/env bash
# Install Nodejs (via nvm)
sudo apt-get update
sudo apt-get install build-essential libssl-dev -y
curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

nvm ls-remote
nvm install 8.9.4
node -v

# Install mongodb
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
echo "deb http://repo.mongodb.org/apt/ubuntu "$(lsb_release -sc)"/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list
sudo apt-get update
sudo apt-get install -y mongodb-org

sudo cp ./webgme-dss/deployment/mongod.service /lib/systemd/system/mongod.service
sudo systemctl daemon-reload
sudo systemctl start mongod

# Install docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install -y docker-ce
sudo systemctl status docker
# https://github.com/moby/moby/issues/26799
sudo systemctl stop docker
sudo systemctl daemon-reload
sudo systemctl start docker


# Install nginx and stop it (it will be configured and started at the end)
sudo apt-get update
sudo apt-get install nginx -y
sudo systemctl stop nginx

# Generate (self-signed ssl certificates for ngnix)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/nginx-selfsigned.key -out /etc/ssl/certs/nginx-selfsigned.crt -subj "/C=US/ST=Tennessee/L=Nashville/O=VU Name/OU=Org/CN=www.my-domain.org"

# Generate token_keys for webgme
mkdir token_keys
openssl genrsa -out token_keys/private_key 1024
openssl rsa -in token_keys/private_key -pubout > token_keys/public_key

# Clone the repo and install dependencies and build
git clone https://github.com/webgme/webgme-dss.git

# Install the
cd webgme-dss

# Build the docker image
sudo docker build -t webgme-om-worker .

# Install dependencies for the webgme server
npm install --no-bin-links
npm run build
# Add an admin user
NODE_ENV=deployment node ./node_modules/webgme-engine/src/bin/usermanager useradd -c -s admin admin@mail.com admin

# Take us home!
cd ..

# Setup the systemd service for webgme and start it (it will be listening at 8888)
sudo cp ./webgme-dss/deployment/webgme.service /lib/systemd/system/webgme.service
sudo systemctl daemon-reload
sudo systemctl start webgme

# Configure nginx (it will forward request made to 443 to 8888)
sudo cp ./webgme-dss/deployment/nginx.conf /etc/nginx/nginx.conf
sudo systemctl start nginx

# The webgme app is now accessible at port 443 (and 80 will redirect to 443)