const assert = require('chai').assert;
const sinon = require('sinon');

const QueueTestCase = require('./download/QueueTestCase');

describe('Queue', () => {

    describe('Downloading 3 files', () => {
        const test = new QueueTestCase([
            'http://127.0.0.1:3030/',
            'http://127.0.0.1:3030/redirect',
            'http://127.0.0.1:3030/',
        ]);

        before(function(done) { test.buildUp(this, 6000, done) });
        after(() => test.tearDown());

        it('should emit progress event', () => assert.isTrue(test.progressSpy.called));
        it('should emit 3 jobEnd events without error', () => {
            assert.isTrue(test.jobEndSpy.calledThrice);
            assert.isFalse(test.jobEndSpy.calledWith(sinon.match.instanceOf(Error)));
        });
        it('should emit a single end event without error', () => {
            assert.isTrue(test.endSpy.calledOnce);
            assert.isFalse(test.endSpy.calledWith(sinon.match.instanceOf(Error)));
        });
    });

    describe('Aborting an ongoing queue', () => {
        const test = new QueueTestCase([
            'http://127.0.0.1:3030/',
            'http://127.0.0.1:3030/redirect',
            'http://127.0.0.1:3030/',
        ]);

        before(function(done) {
            test.buildUp(this, 2000, done);
            setTimeout(() => test.queue.abort(), 750);
        });
        after(() => test.tearDown());

        it('should emit progress event', () => assert.isTrue(test.progressSpy.called));
        it('should emit a single end event with an error', () => {
            assert.isTrue(test.endSpy.calledOnce);
            assert.isTrue(test.endSpy.calledWith(sinon.match.instanceOf(Error)));
        });
    });

});
