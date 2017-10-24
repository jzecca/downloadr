### v1.3.0 (2017-10-24)

* Replace all synchronous calls by their asynchronous counterparts
* Add `postProcess` parameter to pass a function that will be executed after a successful download, but before jobEnd event is triggered


### v1.2.0 (2017-09-29)

* Add `speed` property to progress event
* Fix progress event `current` property being named `job`
* Fix exception thrown when aborting an idle queue
* Fix queue not being cleared on download end
* Remove optional `data` parameter


### v1.1.0 (2017-07-11)

* Constructor now accepts an array of downloads to add to the queue
* Adds an optional `data` parameter to store whatever we might need later on
* Current job's descriptor _(containing its `url`, `file`, `hash` and `data` properties)_ is now passed as an argument to `progress` & `jobEnd` events


### v1.0.0 (2017-07-10)

First major release.
