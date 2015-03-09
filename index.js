var Promise = require('bluebird')
, tmp = Promise.promisifyAll(require('tmp'))
, fs = Promise.promisifyAll(require('fs'))
;

module.exports = function(stream) {
  return new Promise(function(resolve,reject) {
    stream.on('error', function(err) {
      reject(err);
    });

    tmp.fileAsync().spread(function(path, fd) {
      var writeStream = fs.createWriteStream(path);

      writeStream.on('error', function(err) {
        reject(err);
      });

      writeStream.on('finish', function() {
        var readStream = fs.createReadStream(path);
        readStream.on('end', function() {
          fs.unlinkAsync(path);
        });
        resolve(readStream);
      });

      stream.pipe(writeStream);
    });
  });
};
