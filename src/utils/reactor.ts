class GameEvent {
    name: string = "";
    callbacks: Function[] = [];

    GameEvent(name: string) {
        this.name = name;
        this.callbacks = [];
    }

    register(callback: Function) {
        this.callbacks.push(callback);
    }
}

class Reactor {
    events: GameEvent[] = [];

    on(name: string, callback: Function) {
        let event = this.events.find(event => event.name === name);
        if (!event) {
            event = new GameEvent();
            event.name = name;
            this.events.push(event);
        }
        event.register(callback);
    }

    emit(name: string, ...args: any[]) {
        let event = this.events.find(event => event.name === name);
        if (event) {
            event.callbacks.forEach(callback => callback(...args));
        }
    }
}

export { Reactor, GameEvent };