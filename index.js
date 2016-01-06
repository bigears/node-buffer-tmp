var Promise = require('bluebird');
var tmp = require('tmp');
var fs = require('fs');
var debug = require('debug')('buffer-tmp');

module.exports = function(stream) {
  return new Promise(function(resolve,reject) {
    stream.on('error', function(err) {
      reject(err);
    });

    tmp.file(function tempFileCreated(err, path, fd, cleanupCallback) {
      if(err) { return reject(err); }

      debug('file:', path);

      var writeStream = fs.createWriteStream(path, {
        defaultEncoding: 'binary',
        fd: fd
      });

      writeStream.on('error', function(err) {
        reject(err);
      });

      writeStream.on('finish', function() {
        var readStream = fs.createReadStream(path, {
          encoding: 'binary'
        });
        readStream.on('end', function() {
          cleanupCallback();
        });
        resolve(readStream);
      });

      stream.pipe(writeStream);
    });
  });
};
