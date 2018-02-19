/**
 * @author kecso / https://github.com/kecso
 */
export default class BasicEventManager {
    constructor() {
        this.subscribers = {};
        this.lastEvents = {};

        this.subscribe = this.subscribe.bind(this);
        this.unsubscribe = this.unsubscribe.bind(this);
        this.fire = this.fire.bind(this);
    }

    fire(id, event) {
        const oldEvent = this.lastEvents[id];
        this.lastEvents[id] = event;
        if (JSON.stringify(oldEvent) !== JSON.stringify(event)) {
            (this.subscribers[id] || []).forEach((eventFn) => {
                eventFn(id, event);
            });
        }
    }

    subscribe(id, eventFn) {
        this.subscribers[id] = this.subscribers[id] || [];
        this.subscribers[id].push(eventFn);
        return this.lastEvents[id];
    }

    unsubscribe(id, eventFn) {
        this.subscribers[id] = this.subscribers[id] || [];
        this.subscribers[id].splice(this.subscribers[id].indexOf(eventFn), 1);
    }
}
