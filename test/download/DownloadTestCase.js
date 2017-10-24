const fs = require('fs');
const os = require('os');
const path = require('path');
const sha = require('sha');
const sinon = require('sinon');

const Download = require('../../lib/Download');
const TestServer = require('../server/TestServer');

class DownloadTestCase
{
    /**
     * Constructor.
     *
     * @param {string} url
     */
    constructor({url}) {
        this._server = new TestServer({
            assetSize: 6 * 1024,
            maxSpeed:  4 * 1024,
        });

        this._file = {
            path:   path.join(os.tmpdir(), '.downloadr-test-file'),
            exists: false,
            hash:   null,
            size:   null,
        };

        this._source = {
            hash: this._server.asset.hash,
            size: this._server.asset.size,
        };

        this._download = new Download({
            url:  url,
            file: this._file.path,
            hash: this._server.asset.hash,
        });
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
            this._endSpy      = sinon.spy();

            this._download.on('progress', this._progressSpy);
            this._download.on('end',      this._endSpy);

            this._download.on('end', () => {
                this.checkFile();
                done();
            });

            this._download.start();
        });
    }

    /**
     * Tears test down.
     */
    tearDown() {
        this._server.stop();
        this._download.removeAllListeners();

        try {
            fs.unlinkSync(this._file.path);
        } catch (e) {}
    }

    /**
     * Checks downloaded file.
     *
     * @private
     */
    checkFile() {
        if (!fs.existsSync(this._file.path)) {
            return;
        }

        this._file.exists = true;
        this._file.size   = fs.statSync(this._file.path).size;
        this._file.hash   = sha.getSync(this._file.path);
    }

    /**
     * @return {Download}
     */
    get download() {
        return this._download;
    }

    /**
     * @return {{path: string, exists: boolean, size: int|null, hash: string|null}}
     */
    get file() {
        return this._file;
    }

    /**
     * @return {{hash: string, size: int}}
     */
    get source() {
        return this._source;
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
    get endSpy() {
        return this._endSpy;
    }
}

module.exports = DownloadTestCase;
