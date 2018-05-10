# WebGME-DSS

## Getting started
#### Dependencies
To run the server application on a local machine first install nodejs and mongodb
 - For windows downloading the LTS from [nodejs.org](https://nodejs.org/en/) is a viable solution for linux [nvm](https://github.com/creationix/nvm) is recommended.
 - WebGME uses mongodb as model storage and works well with the [community-edition](https://www.mongodb.com/download-center#community).
 - In addition you'll need [git](https://git-scm.com/) to clone this repo and for installing some of the node_modules. 

#### Build and start the application
##### Installing node_modules and building app
Clone this repo:
```
git clone https://github.com/webgme/webgme-dss.git
```

Next install the node_modules (defined as dependencies in `package.json`).
```
npm install
```

You'll need to build the distribution files (will be put in /build) initially and after there's been changes to the source code.
```
npm run build
```

##### Starting the application
Start mongod locally at the default port (27017) by default the models will be put inside `multi` you can configure this
in `./config/config.default.js` which is the [configuration for webgme](https://github.com/webgme/webgme-engine/blob/master/config/README.md).

windows (example)
```
"C:\Program Files\<mongodb>\bin\mongod" --dbpath "C:\dirToStoreFiles"
```

linux/macOS
```
mongodb --dbpath <dirToStoreFiles>
```

With mongodb running start the webgme-server
```
npm start
```

It will print out the url (by default localhost:8888)

## Deploying
For a full deployment you'll need nodejs, mongodb and docker.

 1. clone this repo `git clone https://github.com/webgme/webgme-dss.git`
 2. build the docker worker image `docker build -t webgme-dss-worker .` for OpenModelica or `docker build -f DockerfileJMod -t webgme-dss-worker .`
 3. build the front-end (`npm install`) `npm run build`
 4. before starting server make sure to use `config/config.dockerworker.js` via the env. var `NODE_ENV=dockerworker` (alternatively create a config on top of it)


## Developers

The front-end app can run both with webgme as backend and with a mock. Note that both these can run at the same time.

### Building app and run with webgme
This requires that mongodb is running and the webgme server can access it.

- Build distribution (TODO: How to build quicker?)
    - `npm run build`
- Start server
    - `npm start`
- View app in browser
    - [localhost:8888](http://localhost:8888)

### Running app with mock webgme

- Start build watcher
    - `npm mock`
- View app in browser
    - [localhost:3000](http://localhost:3000)
    

### Creating the Modelica Seed
 1. Follow the instructions in /scripts/py_modelica_exporter/README.md to generate `components.json`
 2. From `src/common/` run `node preprocessComponents.js` (it consumes `components.json` from step one)
    - If the PortMapping does not exist - the `ModelicaBaseSeed` and `metadata.json` need to be updated
 3. Create a project from the ModelicaBaseSeed name it e.g. `SeedProject`
 4. From root of repo run: `node node_modules\webgme-engine\src\bin\run_plugin.js SeedCreator SeedProject`