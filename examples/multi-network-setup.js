import { TTN, Loriot, Api } from '../src/api.js';

const start = async () => {
    let configuration = {
        "host": '0.0.0.0',
        "port": 1234,
        "providers": {
            "ttn": (settings) => new TTN(settings),
            "loriot": (settings) => new Loriot(settings)
        },
        "networks": {
            "loriot": {
                "type": "loriot",
                "appID": 'ABCDEFG',      // You can find this in your Loriot dashboard
                "token": 'yourtokenhere' // along with this
            },
            "ttn": {
                "type": "ttn",
                "appID": "your-app-id",      // This is the unique name of your app as you registered it
                "accessKey": "yourtokenhere" // and this is its token, available on the dashboard
            }
        }
    };
    let api = new Api(configuration);
    return await api.start();
}
start();