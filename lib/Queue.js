const EventEmitter = require('events').EventEmitter;

const Download = require('./Download');

class Queue extends EventEmitter
{
    /**
     * Constructor.
     *
     * @param {{url: string, file: string, hash: (string|null), data: (Object|null)}[]} [jobsArgs=[]]
     */
    constructor(jobsArgs = []) {
        super();

        this._queue    = [];
        this._position = -1;

        jobsArgs.map(jobArgs => this.add(jobArgs));
    }

    /**
     * Adds a job to the queue.
     *
     * @param {string}      url  - URL to download
     * @param {string}      file - Path to where the file will be written
     * @param {string|null} hash - Expected file hash (null = no hash check)
     * @param {Object|null} data - Custom data - put whatever you might need in here
     */
    add({url, file, hash = null, data = null}) {
        const job = new Download(...arguments);

        this._queue.push(job);
    }

    /**
     * Starts queue.
     */
    start() {
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

        this.currentJob
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
        this.emit('end', err);
    }

    /**
     * Aborts queue.
     */
    abort() {
        if (!this.currentJob) {
            return;
        }

        this.currentJob.abort();
        this.currentJob.removeAllListeners();

        this.end(new Error('Aborted'));
    }

    /**
     * Handles job's progress.
     *
     * @param {Number} jobProgress
     *
     * @private
     */
    onJobProgress(jobProgress) {
        const totalProgress = (this._position + jobProgress) / this._queue.length;

        this.emit('progress', this.currentJob.descriptor, {
            job:   jobProgress,
            total: totalProgress,
        });
    }

    /**
     * Handles job's end.
     *
     * @param {Error|null} err
     *
     * @private
     */
    onJobEnd(err) {
        this.currentJob.removeAllListeners();

        this.emit('jobEnd', this.currentJob.descriptor, err);

        this.next();
    }

    /**
     * @return {Download|null}
     *
     * @private
     */
    get currentJob() {
        return this._queue[this._position] || null;
    }
}

module.exports = Queue;
