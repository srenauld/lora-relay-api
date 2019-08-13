export default class Module {
    constructor(settings) {
        if (settings && settings.storage) this.storage = settings.storage;
        if (settings && settings.log) this._log = settings.log;
    }

    async store(eui, status) {
        return await this.storage.store(eui, status);
    }

    debug(message) {
        this._log && this._log.debug(message);
    }
    info(message) {
        this._log && this._log.info(message);
    }

    async start() {
        throw new Error("You need to implement the start() method.");
    }

    async stop() {
        return;
    }

    async toggle(eui, state) {
        throw new Error("You need to implement the toggle(eui, state) method.");
    }
}