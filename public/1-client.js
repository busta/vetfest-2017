//
// client.js
//
// @see http://blog.ricardofilipe.com/post/getting-started-arduino-johhny-five
//
(function() {
  // Open connection to socket.io
  var socket = io.connect(window.location.hostname + ':' + 4000);

  // Reconnect when offline (or waking phone, etc).
  socket.on('reconnect', function (data) {
    socket.send('join', data, function (res, data) {
      console.info('Reconnecting...');
    });
  });

  // RGB controls
  var red = document.getElementById('red');
  var green = document.getElementById('green');
  var blue = document.getElementById('blue');

  // Send values to server
  function emitValues(color, e) {
    socket.emit('rgb', {
      red: red.value,
      green: green.value,
      blue: blue.value,
    });
  }

  // Event listeners, they update on every change.
  red.addEventListener('input', emitValues);
  blue.addEventListener('input', emitValues);
  green.addEventListener('input', emitValues);

  // Initialize page.
  socket.on('connect', function(data) {
    socket.emit('join', socket.id);
  });

  // Listen for updates from server.
  socket.on('rgb', function(data) {
    red.value = data.red ? data.red : red.value;
    green.value = data.green ? data.green : green.value;
    blue.value = data.blue ? data.blue : blue.value;
  });
}());
