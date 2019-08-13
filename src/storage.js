export default class Storage {
    constructor(settings) {
        this.sensors = {};
        this.log = settings && settings.log ? settings.log : null;
    }

    async retrieve(network, eui) {
        if (!this.sensors[network] || !this.sensors[network][eui]) return undefined;
        return this.sensors[network][eui][ this.sensors[network][eui].length - 1 ];
    }

    async store(network, eui, state, force) {
        this.log && this.log.info(`Changing state for device ${eui} (network ${network}) to ${state}`);
        if (!this.sensors[network]) {
            this.sensors[network] = {};
        }
        if (!this.sensors[network][eui]) {
            this.sensors[network][eui] = [];
        }
        if (force) {
            this.sensors[network][eui][1] = state;
        } else {
            if (this.sensors[network][eui].length == 2) {
                if (this.sensors[network][eui][1] === state) {
                    this.sensors[network][eui] = [state];
                }
            } else {
                this.sensors[network][eui][0] = state;
            }
        }
    }
}