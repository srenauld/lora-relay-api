import Module from '../module.js';
import WebSocket from 'ws';

export default class Loriot extends Module {

    constructor(settings) {
        super(settings);
        this.information = {
            appID: settings.appID,
            token: settings.token,
            server: settings.server
        };
    }
    
    async start() {
        this.info('Starting Loriot client');
        this.client = new WebSocket('wss://'+this.information.server+'.loriot.io/app?id='+this.information.appID+'&token='+this.information.token);
        this.client.on('open', () => {
            this.info('Loriot websocket connection successful');
        });
        this.client.on('message', async (message) => {
            let decodedMessage = JSON.parse(message);
            this.info(`Received message type ${decodedMessage.cmd} from Loriot`);
            if (decodedMessage && decodedMessage.cmd && decodedMessage.cmd === "rx") {
                await this.store(decodedMessage.EUI, decodedMessage.data == "01");
            }
        });
    }

    async toggle(eui, state) {
        this.info(`Switching state of device ${eui} to ` + (state ? 'on' : 'off'));
        let message = {
            "cmd": "tx",
            "EUI": eui,
            "port": 1,
            "confirmed": true,
            "data": state ? "01": "00"
        };
        await this.client.send(JSON.stringify(message));
    }

}