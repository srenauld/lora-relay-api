import Module from '../src/communication/module.js';

describe('Module interface', () => {
    it('throws on start()', async (done) => {
        try {
            let m = new Module();
            await m.start();
        } catch (e) {
            done();
        }
    })
    it('throws on toggle())', async (done) => {
        try {
            let m = new Module();
            await m.toggle();
        } catch (e) {
            done();
        }
    })
})