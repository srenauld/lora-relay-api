import assert from 'assert';
import { Api } from '../src/api.js';
import Storage from '../src/storage.js';
import Module from '../src/communication/module';
import sinon from 'sinon';

class CustomModule extends Module {

    constructor(settings) {
        super(settings);
    }

    async toggle(eui, state) {
        return true;
    }
}

describe('API', () => {
    var api = null;
    let customDriver = new CustomModule();
    let stub_toggle = sinon.spy(CustomModule.prototype, "toggle");
    let stub_store = sinon.spy(Storage.prototype, 'store');
    let stub_retrieve = sinon.spy(Storage.prototype, 'retrieve');
    it('Properly initializes', async () => {
        let storage = new Storage();
        await storage.store('test', 'foo', false);

        api = new Api({
            storage: storage,
            providers: {
                'custom': CustomModule
            },
            networks: {
                'test': {
                    type: 'custom'
                }
            }
        });
        // We make sure that our storage mock got applied correctly
        await api.networks['test'].storage.store('foo', false);
        assert(stub_store.calledWith("test", "foo", false));
        assert.equal(await api.networks['test'].storage.retrieve('foo'), false);
        // Our first call should retrieve the status of our device
        let result = await api.server.inject({
            method: 'GET',
            url: '/network/test/device/foo'
        });
        assert(stub_retrieve.calledWith("test", "foo"));
        assert.equal(result.result.state, false);

        // We then flick the switch
        await api.server.inject({
            method: 'POST',
            url: '/network/test/device/foo',
            payload: {
                active: true
            }
        });
        

        // At this point toggle should have been invoked
        assert(stub_toggle.calledWith("foo", true));
        assert(stub_store.calledWith("test", "foo", true, true));
        // ...And we re-inject to see our state change.
        result = await api.server.inject({
            method: 'GET',
            url: '/network/test/device/foo'
        });
        return assert.equal(result.result.state, true);
    });
})