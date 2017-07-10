const fs = require('fs');
const http = require('http');
const path = require('path');
const url = require('url');

const Throttle = require('throttle');

const BinaryAsset = require('./BinaryAsset');

/**
 * TestServer class.
 *
 * Spawns a minimalist HTTP server that only serve a single static asset at a time.
 * Max download speed can be limited to mimic a remote server.
 */
class TestServer
{
    /**
     * Constructor.
     *
     * @param {int} assetSize     - Size of the asset to serve in bytes.
     * @param {int} [maxSpeed=-1] - Max download speed in bytes/s (-1 = disabled)
     */
    constructor({assetSize, maxSpeed = -1}) {
        this._asset    = new BinaryAsset(assetSize);
        this._maxSpeed = maxSpeed;

        this._server = http.createServer((request, response) => this.onRequest(request, response));
    }

    /**
     * Starts HTTP server.
     *
     * @param {int}      port
     * @param {Function} callback
     */
    start(port, callback) {
        this._port = port;

        this._server.listen(port, err => {
            if (err) {
                return console.error(`Error when starting HTTP server: ${err.message}`);
            }

            callback();
        });
    }

    /**
     * Stops HTTP server.
     */
    stop() {
        this._server.close();
    }

    /**
     * Serves asset.
     *
     * @param {ClientRequest}  request
     * @param {ServerResponse} response
     *
     * @private
     */
    onRequest(request, response) {
        switch (request.url) {
            case '/redirect':   return this.redirect(response, '/');
            case '/error/404':  return this.serveError(response, 404);
            case '/error/500':  return this.serveError(response, 500);
            default:            return this.serveAsset(response);
        }
    }

    /**
     * Redirects to given URL.
     *
     * @param {ServerResponse} response
     * @param {string}         url
     *
     * @private
     */
    redirect(response, url) {
        response.writeHead(301, {
            Location: `http://127.0.0.1:${this._port}${url}`
        });
        response.end();
    }

    /**
     * Serves error.
     *
     * @param {ServerResponse} response
     * @param {int}            code
     *
     * @private
     */
    serveError(response, code) {
        response.writeHead(code);
        response.write(http.STATUS_CODES[code]);
        response.end();
    }

    /**
     * Serves binary asset.
     *
     * @param {ServerResponse} response
     *
     * @private
     */
    serveAsset(response) {
        response.writeHead(200, {
            'Content-Length': this._asset.size,
            'Content-Type':   'application/octet-stream',
        });

        // Stream the asset with or without speed limitation
        if (this._maxSpeed >= 0) {
            const throttle = new Throttle(this._maxSpeed);
            this._asset.stream.pipe(throttle).pipe(response);
        } else {
            this._asset.stream.pipe(response);
        }
    }

    /**
     * @returns {BinaryAsset}
     */
    get asset() {
        return this._asset;
    }
}

module.exports = TestServer;
