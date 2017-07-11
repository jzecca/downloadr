# Downloadr

Binary file download library built on top of [got](https://github.com/sindresorhus/got).

## Installation

```bash
npm install downloadr
```

## Features

* Progression tracking
* File integrity check
* Abort
* Queue

## Usage

#### Initialization
```javascript
const Downloadr = require('downloadr');

const downloadr = new Downloadr();
```

#### Queue a download
```javascript
downloadr.add({
    url:  'http://localhost/file.zip',
    hash: '4fb8652b2be29734df530fc0cfcaae922564b840', // optional SHA-1 - omit to skip file integrity check
    file: 'file.zip',
    data: { ... } // optional custom data object - put whatever you might need in here
});
```

You can also pass an array of downloads directly to the constructor:

```javascript
const downloadr = new Downloadr([
    {
        url:  'http://localhost/file.zip',
        hash: '4fb8652b2be29734df530fc0cfcaae922564b840',
        file: 'file.zip'
    }
]);
```

#### Event listeners
```javascript
// Progress
downloadr.on('progress', (job, progress) => {
    /*
        job => {
            url:  'http://localhost/file.zip',
            hash: '4fb8652b2be29734df530fc0cfcaae922564b840',
            file: 'file.zip'
            data: null
        }

        progress => {
            current: 0.1254,
            total: 0.896
        }
    */
});

// Job end
downloadr.on('jobEnd', (job, err) => {
    if (err) {
        return console.log(`An error occurred: ${err.message}`);
    }

    console.log(`Successfully downloaded ${job.url}`);
});

// End
downloadr.on('end', err => {
    if (err) {
        return console.log(`An error occurred: ${err.message}`);
    }

    console.log('Download queue complete');
});
```

#### Start/abort download queue
```javascript
// Start queue
downloadr.start();

// Abort queue
downloadr.abort();
```

## Tests

To run the test suite, first install the dependencies, then run `npm test`:
```bash
npm install
npm test
```

## Resources

* [Changelog](CHANGELOG.md)

## TODO

* Seen an issue with 0b files
