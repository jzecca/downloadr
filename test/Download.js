const assert = require('chai').assert;
const sinon = require('sinon');

const DownloadTestCase = require('./download/DownloadTestCase');


describe('Download', () => {

     describe('Downloading a file behind a redirection', () => {
        const test = new DownloadTestCase({
            url: 'http://127.0.0.1:3030/redirect'
        });

        before(function(done) { test.buildUp(this, 2000, done) });
        after(() => test.tearDown());

        it('should emit progress event', () => assert.isTrue(test.progressSpy.called));
        it('should emit a single end event without error', () => {
            assert.isTrue(test.endSpy.calledOnce);
            assert.isFalse(test.endSpy.calledWith(sinon.match.instanceOf(Error)));
        });

        describe('Downloaded file', () => {
            it('should exists',            () => assert.isTrue(test.file.exists));
            it('should have correct size', () => assert.strictEqual(test.file.size, test.source.size));
            it('should have correct hash', () => assert.strictEqual(test.file.hash, test.source.hash));
        });
    });


     describe('Aborting an ongoing download', () => {
         const test = new DownloadTestCase({
             url: 'http://127.0.0.1:3030/'
         });

         before(function(done) {
             test.buildUp(this, 2000, done);
             setTimeout(() => test.download.abort(), 750);
         });
         after(() => test.tearDown());

         it('should emit progress event',   () => assert.isTrue(test.progressSpy.called));
         it('should emit a single end event with an error', () => {
             assert.isTrue(test.endSpy.calledOnce);
             assert.isTrue(test.endSpy.calledWith(sinon.match.instanceOf(Error)));
         });
         it('should remove file from disk', () => assert.isFalse(test.file.exists));
     });


    describe('Requesting a file that does\'t exist', () => {
        const test = new DownloadTestCase({
            url: 'http://127.0.0.1:3030/error/404',
        });

        before(function(done) {
            test.buildUp(this, 1000, done);
        });
        after(() => test.tearDown());

        it('should not emit any progress event', () => assert.isFalse(test.progressSpy.called));
        it('should emit a single end event with an error', () => {
            assert.isTrue(test.endSpy.calledOnce);
            assert.isTrue(test.endSpy.calledWith(sinon.match.instanceOf(Error)));
        });
        it('should not write file to disk',      () => assert.isFalse(test.file.exists));
    });

});
