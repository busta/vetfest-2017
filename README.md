# Bustapixel

Activities to demonstrate web-powered electronics. Uses Arduino, Johnny Five, and NeoPixels.

## Wiring the Arduino

The wiring diagram for all activites is the same:

* Arduino Uno R3
* AdaFruit NeoPixel 8x8 64 RGB LED matrix
* `5V` pin to `5V` on NeoPixel
* `GND` pin to `GND` on NeoPixel
* `6` pin to `DIN` on NeoPixel

If you want or need to change the pin, just look for the `strip` definition in any file. It's near the beginning and contains all LED hardware config.

```js
strip = new pixel.Strip({
  board: this,
  controller: "FIRMATA",
  strips: [ {pin: 6, length: 64}, ],
  gamma: 2.6,
});
```

Same goes for if you hook up a different NeoPixel. This codebase assumes a 64-LED 8x8 matrix. But if you have a 12-LED ring, then change `length` to 12. Not all examples are guaranteed to work with other hardware, but they might in some cases.

## Installation

There are three software components you need to install. Two are on your computer (or whatever you use as a server), and the third is on the Arduino itself.

* [Install node.js 4.2.1](https://nodejs.org/en/blog/release/v4.2.1/), per Johnny Five docs
* Run the following commands to set up the hardware:

```bash
# after node.js is installed
npm install -g nodebots-interchange

# make sure Arduino is connected via USB before running
interchange install git+https://github.com/ajfisher/node-pixel -a uno --firmata
```

## Activities

Pick one of the following commands to choose an activity:

```
# run activity 1
node 1-rgb-led.js

# run activity 2
node 2-rgb-panes.js
```

The command line will report an IP which you can connect to if you use the same wifi as the server. Use your phone to connect and try the activity!
