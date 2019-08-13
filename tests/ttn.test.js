import * as ttn from 'ttn';
import assert from 'assert';
import TTNModule from '../src/communication/ttn/index.js';
import sinon from 'sinon';

describe('TTN module', () => {
    
    let callbacks = {
        "uplink": []
    };
    
    let stubInnerMethods = {
        on: sinon.spy((event, callback) => {
            callbacks[event].push(callback)
        }),
        send: sinon.spy((eui, message) => true)
    };

    ttn.data = sinon.stub().returns(stubInnerMethods);

    let storageStub = {
        store: sinon.stub().returns(true)
    };

    let module = new TTNModule({
        appID: 'foo',
        accessKey: 'bar',
        storage: storageStub
    });

    it("Properly initializes", async () => {

        await module.start();
        assert(ttn.data.calledOnceWith("foo", "bar"));
        // Simulate an uplink
    })
    it('Listens for updates', async () => {
        callbacks.uplink.forEach((cb) => cb('foobar', {
            payload_raw: Buffer.from([0x01])
        }));
        assert(storageStub.store.calledOnceWith("foobar", true));
    });
    it('Allows the user to toggle their remote power switch', async () => {
        // We then toggle the relay. We do it twice, with both states, in order to make sure the buffers are correct
        await module.toggle("foobar", false);
        assert(stubInnerMethods.send.calledWith("foobar", Buffer.from([0x00], null, true)));
        
        await module.toggle("foobar", true);
        assert(stubInnerMethods.send.calledWith("foobar", Buffer.from([0x01], null, true)));

    });
})