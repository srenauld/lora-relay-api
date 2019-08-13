import Storage from '../src/storage.js';
import assert from 'assert';

describe('storage driver', () => {
    it('should be able to store and retrieve status', async () => {
        let storage = new Storage();
        assert.equal(await storage.retrieve('foo', 'bar'), undefined);
        await storage.store('foo', 'bar', false);
        assert.equal(await storage.retrieve('foo', 'bar'), false);
    });
    it('should allow a forced state until the next status', async () => {
        let storage = new Storage();
        await storage.store('foo', 'bar', false);
        assert.equal(await storage.retrieve('foo', 'bar'), false);
        await storage.store('foo', 'bar', true, true);
        assert.equal(await storage.retrieve('foo', 'bar'), true);
        // This should be a no-op
        await storage.store('foo', 'bar', false);
        assert.equal(await storage.retrieve('foo', 'bar'), true);
        // And this resets the chain
        await storage.store('foo', 'bar', true);
        assert.equal(await storage.retrieve('foo', 'bar'), true);
        await storage.store('foo', 'bar', false);
        assert.equal(await storage.retrieve('foo', 'bar'), false);
    });
});