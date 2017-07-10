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
const Downloadr = require('Downloadr');

const downloadr = new Downloadr();
```

#### Queue a download
```javascript
downloadr.add({
    url:  'http://localhost/file.zip',
    hash: '4fb8652b2be29734df530fc0cfcaae922564b840',
    file: 'file.zip'
});
```

#### Event listeners
```javascript
// Progress
downloadr.on('progress', (current, total) => {
    console.dir(current);
    console.dir(total);
});

// Job end
downloadr.on('jobEnd', err => {
    if (err) {
        return console.log(`An error occured: ${err.message}`);
    }

    console.log('Download complete');
});

// End
downloadr.on('end', err => {
    if (err) {
        return console.log(`An error occured: ${err.message}`);
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
