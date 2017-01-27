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

    // Initial state for the LED light
    let state = {
      red: 0,
      green: 96,
      blue: 48,
    };

    // Helper function to set the colors
    let setStripColor = function(state) {
      console.log('rgb('+ state.red +','+ state.green +','+ state.blue +')');
      strip.color('rgb('+ state.red +','+ state.green +','+ state.blue +')');
      strip.show();
    };

    // Finish init process by updating NeoPixel.
    setStripColor(state);

    // Listen to the web socket connection
    io.on('connection', function(client) {
      client.on('join', function(id) {
        console.log('👥➡🚪  '+ id +' joined');

        // Sync the UI controls to current state
        io.to(id).emit('rgb', state);
      });

      // Every time a 'rgb' event is sent, listen to it and grab its new values for each individual colour
      client.on('rgb', function(data) {
        state.red = data.red !== 'undefined' ? data.red : state.red;
        state.green = data.green !== 'undefined' ? data.green : state.green;
        state.blue = data.blue !== 'undefined' ? data.blue : state.blue;

        // Set the new colors
        setStripColor(state);

        // client.emit('rgb', data);
        client.broadcast.emit('rgb', data);
      });
    });
  });
});

const port = process.env.PORT || 4000;
server.listen(port, '0.0.0.0');
console.log(`Server listening on http://localhost:${port}`);
