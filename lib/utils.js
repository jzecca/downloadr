const crypto = require('crypto');
const fs = require('fs');

/**
 * Computes file hash.
 *
 * @param {string} path             - File path
 * @param {string} [algorithm=sha1] - Digest algorithm
 *
 * @returns {string|null}
 */
function fileHash(path, algorithm = 'sha1') {
    try {
        const buffer = fs.readFileSync(path);
        const hash = crypto.createHash(algorithm);

        return hash.update(buffer).digest('hex').toLowerCase().trim();
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
function fileSize(path) {
    try {
        const stat = fs.statSync(path);

        return stat.size;
    }
    catch (err) {
        return 0;
    }
}

module.exports.fileHash = fileHash;
module.exports.fileSize = fileSize;
