# WebGME-DSS

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
