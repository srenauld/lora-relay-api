
import assert from 'assert';
import LoriotModule from '../src/communication/loriot/index.js';
import sinon from 'sinon';
import ws from 'ws';
import winston from 'winston';

jest.mock('ws', () => {
    return jest.fn().mockImplementation( function() {
        
        let callbacks = {
            "message": [],
            "open": []
        };
        this.emit = jest.fn(function(event, data) {
                callbacks[event].forEach((cb) => cb(data));
        });
        this.on = jest.fn(function(event, cb) {
                callbacks[event].push(cb);
                return true;
        });
        this.send = jest.fn(function(data) {
            return true;
        });
    });
});

describe('Loriot module', () => {

    let storageStub = {
        store: sinon.stub().returns(true)
    };

    let module = new LoriotModule({
        appID: 'foo',
        log: winston.createLogger({
            transports: [new winston.transports.Console()]
        }),
        token: 'bar',
        server: 'eu2',
        storage: storageStub
    });
    var mockedWS = null;
    it("Properly initializes", async () => {
        await module.start();
        mockedWS = require('ws').mock.instances[0];
        assert.equal(require('ws').mock.calls[0][0], "wss://eu2.loriot.io/app?id=foo&token=bar");
        module.client.emit("open");
        assert.equal(mockedWS.on.mock.calls.length, 2);
        assert.equal(mockedWS.on.mock.calls[0][0], 'open');
        
    });
    it('Receives uplinks and updates state accordingly', async () => {
        module.client.emit("message", JSON.stringify({
            "cmd": "rx",
            "EUI": "foobar",
            "data": "01"
        }));
        assert(storageStub.store.calledOnceWith("foobar", true));
    });
    it('Is capable of updating the state of the relay', async () => {
        await module.toggle("foobar", false);
        assert.deepEqual(mockedWS.send.mock.calls[0][0], JSON.stringify({
            "cmd": "tx",
            "EUI": "foobar",
            "port": 1,
            "confirmed": true,
            "data": "00"
        }));
    });
})