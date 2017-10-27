const TestDriver = require('./test-driver.js');

// TODO: remove in year 3000 when TC39 finally specs this
// eslint-disable-next-line no-extend-native
Array.prototype.last = Array.prototype.last || function() { return this[this.length - 1]; };

describe('basic editing', () => {
    test('undo sends all changes as a single replace', async () => {
        const driver = await TestDriver.new({ textWithCursor: '{d:f2}{d:f2}|' });
        const cm = driver.getCodeMirror();

        driver.type.backspace('{d:f2}'.length);
        cm.execCommand('undo');
        await driver.completeBackgroundWork();

        const lastSent = driver.socket.sent.filter(c => !c.startsWith('U')).last();
        expect(lastSent).toBe('R6:0:12::{d:f2}');
    });
});

describe('produced events', () => {
    test('slowUpdateWait is triggered on first change', async () => {
        const slowUpdateWait = jest.fn();
        const driver = await TestDriver.new({ options: { on: { slowUpdateWait } } });

        driver.type.text('x');
        await driver.completeBackgroundWork();

        expect(slowUpdateWait.mock.calls).toEqual([[]]);
    });
});