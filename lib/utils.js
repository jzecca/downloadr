const fs = require('fs');
const pify = require('pify');
const sha = require('sha');

/**
 * Computes file hash.
 *
 * @param {string} path             - File path
 * @param {string} [algorithm=sha1] - Digest algorithm
 *
 * @returns {string|null}
 */
async function fileHash(path, algorithm = 'sha1') {
    try {
        return await pify(sha.get)(path, {
            algorithm: algorithm
        });
    }
    catch (err) {
        return null;
    }
}

/**
 * Gets file size in bytes.
 *
 * @param {string} path - File path
 *
 * @returns {int}
 */
async function fileSize(path) {
    try {
        return (await pify(fs.stat)(path)).size;
    }
    catch (err) {
        return 0;
    }
}

module.exports.fileHash = fileHash;
module.exports.fileSize = fileSize;
