### v1.1.0 (2017-07-XX)

* Constructor now accepts an array of downloads to add to the queue.
* Adds an optional `data` parameter to store whatever we might need later on.
* Current job's descriptor _(containing its `url`, `file`, `hash` and `data` properties)_ is now passed as an argument to `progress` & `jobEnd` events.

### v1.0.0 (2017-07-10)

First major release.