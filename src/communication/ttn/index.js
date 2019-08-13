import Module from '../module.js';
import { data } from 'ttn';

export default class TTN extends Module {

    constructor(settings) {
        super(settings);
        this.information = {
            appID: settings.appID,
            accessKey: settings.accessKey
        };
    }

    async start() {
        this.info("Starting TTN client");
        this.client = await data(this.information.appID, this.information.accessKey);
        this.bind();
    }
    bind() {
        this.client.on("uplink", async (devID, payload) => {
            
            this.info(`Received uplink packet from device ${devID}`);
            this.debug("EUI: "+devID+", packet: "+JSON.stringify(payload));

            await this.store(devID, payload.payload_raw.equals(Buffer.from([0x01])));
        });
    }

    async toggle(eui, state) {
        this.info(`Switching state of device ${eui} to ${state == true ? 'on' : 'off'}`);
        let toSend = Buffer.from([state ? 0x01 : 0x00]);
        return await this.client.send(eui, toSend, null, true);
    }

}