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

# Install docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install -y docker-ce
sudo systemctl status docker

# Clone the repo and install dependencies and build
git clone https://github.com/webgme/webgme-dss.git
cd webgme-dss

# Build the docker image
docker build -t webgme-om-worker .

# Install dependencies
npm install
npm run build

# Setup systemd services
sudo cp ./deployment/mongod.service /lib/systemd/system/mongod.service
sudo systemctl daemon-reload
sudo systemctl start mongod

sudo cp ./deployment/webgme.service /lib/systemd/system/webgme.service
sudo systemctl daemon-reload
sudo systemctl start webgme