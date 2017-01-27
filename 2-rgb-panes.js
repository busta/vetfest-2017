'use strict';

const pixel = require('node-pixel');
const five = require('johnny-five');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

var strip = null;

app.use(express.static(__dirname + '/public'));

five.Board().on('ready', function() {
  console.log('Arduino is ready.');
  var led = new five.Led(10);
  led.brightness(48);

  // Setup the NeoPixel ring
  strip = new pixel.Strip({
    board: this,
    controller: "FIRMATA",
    strips: [ {pin: 6, length: 64}, ],
    gamma: 2.6, // 3.6 = night, 2.6 = bright day
  });

  // Start app after NeoPixel is ready.
  strip.on("ready", function() {
    console.log("NeoPixel is ready with " + strip.length + " LEDs");
    strip.off();

    // Initial state for the LED light
    let states = [];

    // Helper function to set the colors
    let setStripColor = function(states) {
      var numPanes = states.length;
      var paneSize = Math.floor(strip.length / numPanes);

      states.forEach(function (v, i, states) {
        // the loop always draws one pixel too far, but that will be overridden
        // by the next pass of the loop. In this way, we can allow the last pane
        // to draw over pixel 64 in cases where there are rounding errors.
        for (var x = paneSize*i; x < paneSize*(i+1) + 1; x++) {
          if (x >= 0 && x <= 63) {
            console.log('pane-'+i+' pixel-'+x+' color-' + states[i].red +','+ states[i].green +','+ states[i].blue);
            strip.pixel(x).color('rgb('+ states[i].red +','+ states[i].green +','+ states[i].blue +')');
          } else {
            console.log('skipping strip.pixel('+ x +')');
          }
        }
      });

      strip.show();
    };

    // Listen to the web socket connection
    io.on('connection', function(client) {
      var serverID;

      client.on('join', function(id) {
        states.push({'id': id, red: 0, green: 0, blue: 0});
        console.log('👥➡🚪  '+ id +' joined. Total users: ' + states.length);

        // Tell client what their server-side index is.
        io.to(id).emit('set-id', (states.length - 1));
        var serverID = states.length - 1;
      });

      client.on('disconnect', function (id) {
        states.splice(serverID, 1);
        // TODO
        // - unset server-side index
        // - if necessary, tell others what their new index is
      });

      // Every time a 'rgb' event is sent, listen to it and grab its new values
      // for each individual colour
      client.on('rgb', function(data) {
        states[data.id].red = data.red !== 'undefined' ? data.red : states[data.id].red;
        states[data.id].green = data.green !== 'undefined' ? data.green : states[data.id].green;
        states[data.id].blue = data.blue !== 'undefined' ? data.blue : states[data.id].blue;

        // Set the new colors
        setStripColor(states);

        client.broadcast.emit('rgb', data);
      });
    });
  });
});

const port = process.env.PORT || 4000;
server.listen(port, '0.0.0.0');
console.log(`Server listening on http://localhost:${port}`);
