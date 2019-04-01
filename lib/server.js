const express = require('express');
const app = express();
const compression = require('compression');
const cors = require('cors');
const spawn = require('child_process').spawn;
const stream_live = require('./live');


module.exports = (directory, format, width, height, framerate, horizontalFlip, verticalFlip, compressionLevel, time, listSize, storageSize, port) => {

  let stream = null;
  let timelaps = null;

  // livestream
  app.get('/live_stop', function(req, res) {
    if (stream != null) stream.kill();
    if (timelaps != null) timelaps.kill();
    setTimeout(function() {
     timelaps = spawn('bash', ['/usr/local/lib/node_modules/raspi-live/lib/timelaps.sh']);
     timelaps.stdout.on('data', function(data) {
        console.log('' + data);
     });
     timelaps.stderr.on('data', function(data) {
       console.log('' + data);
     });
     timelaps.on('close', function(code) {
       console.log('closing code: ' + code);
     });

    console.log('timelaps start');
    res.send('timelaps start');
   }, 4000);

  });
  app.get('/live_start', function(req, res) {
    if (timelaps != null) timelaps.kill();
    if (stream != null) stream.kill();
    setTimeout(function() {
      stream = stream_live(directory, format, width, height, framerate, horizontalFlip, verticalFlip, compressionLevel, time, listSize, storageSize, port);
      res.send('stream start');
    }, 4000);
  });

  // timelaps
  app.get('/timelaps_stop', function(req, res) {
    if (timelaps != null) timelaps.kill();
    console.log('timelaps stop');
    res.send('timelaps stop');
  });
  app.get('/timelaps_start', function(req, res) {
    timelaps = spawn('bash', ['/usr/local/lib/node_modules/raspi-live/lib/timelaps.sh']);
    timelaps.stdout.on('data', function(data) {
       console.log('stdout: ' + data);
       //Here is where the output goes
    });
    timelaps.stderr.on('data', function(data) {
      console.log('stderr: ' + data);
      //Here is where the error output goes
    });
    timelaps.on('close', function(code) {
      console.log('closing code: ' + code);
      //Here you can get the exit code of the script
    });

    console.log('timelaps start');
    res.send('timelaps start');
  });

  // Endpoint the streaming files will be available on
  const endpoint = '/camera';
  // Setup express server
  app.use(cors());
  app.use(compression({ level: compressionLevel }));
  app.use(endpoint, express.static(directory));
  app.listen(port);

  console.log('camera server started');
};

