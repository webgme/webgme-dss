/**
 * @author kecso / https://github.com/kecso
 */
export default class ConnectionManager {
    constructor() {
        this.isConnecting = false;
        this.type = null;
        this.source = null;
        this.notifyMe = null;

        this.startConnection = this.startConnection.bind(this);
        this.endConnection = this.endConnection.bind(this);
    }

    startConnection(source, type, notifyMe) {
        this.isConnecting = true;
        this.type = type;
        this.source = source;
        this.notifyMe = typeof notifyMe === 'function' ? notifyMe : () => {
            console.log('no notification is sent')
        };
    }

    endConnection() {
        this.isConnecting = false;
        let connection = {source: this.source, type: this.type};
        this.source = null;
        this.type = null;
        this.notifyMe();
        this.notifyMe = null;
        return connection;
    }
};