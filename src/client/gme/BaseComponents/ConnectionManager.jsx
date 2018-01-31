/**
 * @author kecso / https://github.com/kecso
 */
export default class ConnectionManager {
    constructor() {
        this.isConnecting = false;
        this.type = null;
        this.source = null;
        this.notifyMe = null;
        this.changeFn = null;
        this.startPos = null;
        this.currentPos = null;

        this.startConnection = this.startConnection.bind(this);
        this.endConnection = this.endConnection.bind(this);
        this.setListener = this.setListener.bind(this);
        this.clearListener = this.clearListener.bind(this);
    }

    startConnection(source, type, position, notifyMe) {
        this.isConnecting = true;
        this.type = type;
        this.source = source;
        this.startPos = position;
        this.notifyMe = typeof notifyMe === 'function' ? notifyMe : () => {
            console.log('no notification is sent')
        };
        this.fireChange();
    }

    endConnection() {
        this.isConnecting = false;
        let connection = {source: this.source, type: this.type};
        this.source = null;
        this.type = null;
        if (typeof this.notifyMe === 'function')
            this.notifyMe();
        this.notifyMe = null;
        this.fireChange();
        return connection;
    }

    setListener(changeFn) {
        this.changeFn = changeFn;
    }

    clearListener() {
        this.changeFn = null;
    }

    onMouseMove(newPos) {
        this.currentPos = newPos;
        this.fireChange();
    }

    fireChange() {
        if (this.changeFn) {
            this.changeFn({
                isConnecting: this.isConnecting,
                startPos: this.startPos,
                currentPos: this.currentPos
            });
        }
    }
};