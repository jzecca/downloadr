const fs = require('fs');
const os = require('os');
const path = require('path');
const sinon = require('sinon');

const Queue = require('../../lib/Queue');
const TestServer = require('../server/TestServer');

class QueueTestCase
{
    /**
     * Constructor.
     *
     * @param {string[]} urls
     */
    constructor(urls) {
        this._server = new TestServer({
            assetSize: 6 * 1024,
            maxSpeed:  4 * 1024,
        });

        this._tempFile = path.join(os.tmpdir(), '.downloadr-test-file');
        this._queue = new Queue();

        urls.map(url => this._queue.add({
            url:  url,
            file: this._tempFile,
            hash: this._server.asset.hash,
        }));
    }

    /**
     * Builds test up.
     *
     * @param {Mocha.IHookCallbackContext} context
     * @param {int}                        timeout
     * @param {MochaDone}                  done
     */
    buildUp(context, timeout, done) {
        context.timeout(timeout);

        this._server.start(3030, () => {
            this._progressSpy = sinon.spy();
            this._jobEndSpy   = sinon.spy();
            this._endSpy      = sinon.spy();

            this._queue.on('progress', this._progressSpy);
            this._queue.on('jobEnd',   this._jobEndSpy);
            this._queue.on('end',      this._endSpy);

            this._queue.on('end', () => {
                done();
            });

            this._queue.start();
        });
    }

    /**
     * Tears test down.
     */
    tearDown() {
        this._server.stop();
        this._queue.removeAllListeners();

        try {
            fs.unlinkSync(this._tempFile);
        } catch (e) {}
    }

    /**
     * @return {Queue}
     */
    get queue() {
        return this._queue;
    }

    /**
     * @return {sinon.spy}
     */
    get progressSpy() {
        return this._progressSpy;
    }

    /**
     * @return {sinon.spy}
     */
    get jobEndSpy() {
        return this._jobEndSpy;
    }

    /**
     * @return {sinon.spy}
     */
    get endSpy() {
        return this._endSpy;
    }
}

module.exports = QueueTestCase;
