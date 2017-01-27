//
// client.js
//
(function() {
  // Open connection to socket.io
  var socket = io.connect(window.location.hostname + ':' + 4000);

  // Reconnect when offline (or waking phone, etc).
  socket.on('reconnect', function (data) {
    socket.send('join', data, function (res, data) {
      console.info('Connecting...');
    });
  });

  // RGB controls
  var red = document.getElementById('red');
  var green = document.getElementById('green');
  var blue = document.getElementById('blue');

  // Send values to server
  function emitValues(color, e) {
    socket.emit('rgb', {
      id: socket.index,
      red: red.value,
      green: green.value,
      blue: blue.value,
    });
  }

  // Event listeners, they update on every change, but we have a debounce to
  // avoid sending excessive data which slows the LED refresh rate.
  red.addEventListener('input', debounce(emitValues, 32));
  blue.addEventListener('input', debounce(emitValues, 32));
  green.addEventListener('input', debounce(emitValues, 32));

  // Initialize page.
  socket.on('connect', function(data) {
    socket.emit('join', socket.id);
  });

  // Set server-side ID on client.
  socket.on('set-id', function (id) {
    socket.index = id;
    console.debug('my socket index is: ' + id);
  });
}());

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};
