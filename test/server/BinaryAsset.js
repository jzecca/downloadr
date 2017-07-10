const crypto = require('crypto');
const Duplex = require('stream').Duplex;

/**
 * BinaryAsset class.
 *
 * Generates a random binary buffer that can be served as a fake static file.
 */
class BinaryAsset
{
    /**
     * Constructor.
     *
     * @param {int} size - Size in bytes
     */
    constructor(size) {
        this._size   = size;
        this._buffer = crypto.randomBytes(this._size);
        this._hash   = crypto.createHash('sha1').update(this._buffer).digest('hex').toLowerCase().trim();
    }

    /**
     * @return {Buffer}
     */
    get buffer() {
        return this._buffer;
    }

    /**
     * @return {string}
     */
    get hash() {
        return this._hash;
    }

    /**
     * @return {int}
     */
    get size() {
        return this._size;
    }

    /**
     * Gets buffer as a stream.
     * @see http://derpturkey.com/buffer-to-stream-in-node/
     *
     * @return {Duplex}
     */
    get stream() {
        const stream = new Duplex();

        stream.push(this._buffer);
        stream.push(null);

        return stream;
    }
}

module.exports = BinaryAsset;
