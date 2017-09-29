const EventEmitter = require('events').EventEmitter;

const Download = require('./Download');

class Queue extends EventEmitter
{
    /**
     * Constructor.
     *
     * @param {{url: string, file: string, hash: (string|null)}[]} [jobsArgs=[]]
     */
    constructor(jobsArgs = []) {
        super();

        this._currentJob = null;
        this._queue = [];
        this._position = -1;

        jobsArgs.map(jobArgs => this.add(jobArgs));
    }

    /**
     * Adds a job to the queue.
     *
     * @param {string}      url  - URL to download
     * @param {string}      file - Path to where the file will be written
     * @param {string|null} hash - Expected file hash (null = no hash check)
     */
    add({url, file, hash = null}) {
        const job = new Download(...arguments);

        this._queue.push(job);
    }

    /**
     * Starts queue.
     */
    start() {
        this.abort();
        this.next();
    }

    /**
     * Starts next job.
     *
     * @private
     */
    next() {
        if (++this._position === this._queue.length) {
            return this.end();
        }

        this._currentJob = this._queue[this._position];
        this._currentJob
            .on('progress', progress => this.onJobProgress(progress))
            .on('end',      err      => this.onJobEnd(err))
            .start();
    }

    /**
     * Ends queue.
     *
     * @param {Error|null} err
     *
     * @private
     */
    end(err = null) {
        this._currentJob = null;
        this._queue = [];
        this._position = -1;

        this.emit('end', err);
    }

    /**
     * Aborts queue.
     */
    abort() {
        if (!this._currentJob) {
            return;
        }

        this._currentJob.abort();
        this._currentJob.removeAllListeners();

        this.end(new Error('Aborted'));
    }

    /**
     * Handles job's progress.
     *
     * @param {Object} progress
     * @param {Number} progress.current
     * @param {Number} progress.speed
     * @param {Number} progress.total
     *
     * @private
     */
    onJobProgress(progress) {
        progress.total = (this._position + progress.current) / this._queue.length;

        this.emit('progress', this._currentJob.descriptor, progress);
    }

    /**
     * Handles job's end.
     *
     * @param {Error|null} err
     *
     * @private
     */
    onJobEnd(err) {
        this._currentJob.removeAllListeners();

        this.emit('jobEnd', this._currentJob.descriptor, err);

        this.next();
    }
}

module.exports = Queue;
