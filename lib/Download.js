const EventEmitter = require('events').EventEmitter;
const fs = require('fs');
const got = require('got');
const progress = require('progress-stream');

const { fileHash, fileSize } = require('./utils');

class Download extends EventEmitter
{
    /**
     * Constructor.
     *
     * @param {string}      url  - URL to download
     * @param {string}      file - Path to where the file will be written
     * @param {string|null} hash - Expected file hash (null = no hash check)
     */
    constructor({url, file, hash = null}) {
        super();

        this._url  = url;
        this._file = file;
        this._hash = hash;

        // Disposable references
        this._request        = null;
        this._stream         = null;
        this._writeStream    = null;
        this._progressStream = null;
    }

    /**
     * Starts download.
     *
     * TODO: Implement timeout (needed?)
     * TODO: Remove progress-stream dependency once progress events will be made available in got
     * @see https://github.com/sindresorhus/got/pull/322
     */
    start() {
        const options = {
            encoding: null, // enforce binary transfer
            retries:  0,    // disable got retries
        };

        this._stream = got.stream(this._url, options)
            .on('error',    err      => this.onEnd(err))
            .on('request',  request  => this._request = request)
            .on('response', response => {
                this._size = parseInt(response.headers['content-length']) || 0;

                // Initialize write stream
                this._writeStream = fs.createWriteStream(this._file)
                    .on('error',  err => this._writeStream.close(() => this.onEnd(err)))
                    .on('finish', ()  => this._writeStream.close(() => this.onEnd()));

                // Initialize stream progress
                this._progressStream = progress({ length: this._size, time: 500 })
                    .on('progress', progress => {
                        this.emit('progress', {
                            current: progress.percentage / 100,
                            speed:   progress.speed,
                        });
                    });

                // Write to disk
                this._stream
                    .pipe(this._progressStream)
                    .pipe(this._writeStream);
            });
    }

    /**
     * Cleans references & listeners.
     *
     * @private
     */
    dispose() {
        this._request        && this._request.abort();
        this._stream         && this._stream.removeAllListeners();
        this._writeStream    && this._writeStream.removeAllListeners();
        this._progressStream && this._progressStream.removeAllListeners();
    }

    /**
     * Aborts download.
     */
    abort() {
        this.onEnd(new Error('Aborted'));
    }

    /**
     * Handles download's end.
     *
     * @param {Error|null} err
     *
     * @private
     */
    onEnd(err = null) {
        this.dispose();

        // Check file size
        if (!err && this._size > 0) {
            const size = fileSize(this._file);

            if (size !== this._size) {
                err = new Error(`Incorrect file size (${size}, expected: ${this._size})`);
            }
        }

        // Check file hash
        if (!err && this._hash) {
            const hash = fileHash(this._file);

            if (hash !== this._hash) {
                err = new Error(`Incorrect file hash (${hash}, expected: ${this._hash})`);
            }
        }

        // Remove file if an error happened
        if (err) {
            try {
                fs.unlinkSync(this._file);
            } catch (e) {} // let it fail silently
        }

        this.emit('end', err);
    }

    /**
     * Gets this instance descriptor.
     *
     * @return {{url: string, file: string, hash: (string|null)}}
     */
    get descriptor() {
        return {
            url:  this._url,
            file: this._file,
            hash: this._hash,
        };
    }
}

module.exports = Download;
