import Hapi from '@hapi/hapi';
import Storage from './storage.js';
import TTN from './communication/ttn/index.js';
import Loriot from './communication/loriot/index.js';

class Api {

    constructor(settings) {

        this.server = Hapi.server({
            port: settings.port || 3000,
            host: settings.host || '0.0.0.0'
        });
        this.providers = settings.providers || {};
        this.log = settings && settings.log ? settings.log : null;
        this.storage = settings.storage || new Storage();
        this.networks = Object.entries(settings.networks).reduce( (current, [networkId, settings]) => {
            let client = null;
            settings.log = this.log;
            
            settings.storage = {
                store: async (eui, state) => {
                    return await this.storage.store(networkId, eui, state, false);
                },
                retrieve: async (eui) => {
                    return await this.storage.retrieve(networkId, eui);
                }
            };

            if (settings.type && this.providers[settings.type]) {
                client = new (this.providers[settings.type])(settings);
            }
            if (!client) return current;
            current[networkId] = client;
            return current;
        }, {});
        this.bind();
    }

    bind() {
        this.server.route({
            method: 'GET',
            path: '/network/{network}/device/{eui}',
            handler: async (request, h) => {
                this.log && this.log.info(`${request.info.address} - GET /network/${request.params.network}/devices/${request.params.eui}`);
                if (!this.networks[request.params.network]) return h.response({
                    "error": "network_not_found"
                }).code(404);

                let state = await this.storage.retrieve(request.params.network, request.params.eui);
                if (state === undefined) return h.response({
                    "error": "device_not_found"
                }).code(404);

                return {
                    "network": request.params.network,
                    "eui": request.params.eui,
                    "state": state
                };
            }
        });
        this.server.route({
            method: 'POST',
            path: '/network/{network}/device/{eui}',
            handler: async (request, h) => {
                this.log && this.log.info(`${request.info.address} - POST /network/${request.params.network}/devices/${request.params.eui}`);

                if (!this.networks[request.params.network]) return h.response({
                    "error": "network_not_found"
                }).code(404);
                let payload = request.payload;
                let newState = payload && payload.active && payload.active === true ? true : false;
                // We force the state (due to the LoRa remote power switch providing its status *before* switching)
                await this.storage.store(request.params.network, request.params.eui, newState, true);
                // ... and then we switch
                await this.networks[request.params.network].toggle(request.params.eui, newState);
                return h.response({
                    "status": "ok",
                    "new_state": newState
                }).code(200);
            }
        });
    }

    async start() {
        // Start all the clients and the network server
        let promises = [
            await this.server.start()
        ];
        for (var o of Object.values(this.networks)) {
            promises.push(await o.start());
        }
        return await Promise.all(promises);
    }
}

export { TTN, Loriot, Api };