var rusha = null;
var rushaLoaded = false;
var rushaCallbacks = {};

// A wrapper around Rusha.js
var SHA1 = function(file, callback) {
  if (file === undefined) {
    console.log("Can not hash nil or undefined file");
    return;
  }

  if (callback === undefined) {
    console.log("Must specify a callback function");
    return;
  }

  if (typeof(callback) !== 'function') {
    console.log("Callback must be a function");
    return;
  }

  if (rushaLoaded === false) {
    rusha = new Worker('assets/lib/rusha.js');
    rushaLoaded = true;

    rusha.addEventListener('message', function(e) {
      var callbackFunc = rushaCallbacks[e.data.id];
      if (callbackFunc === undefined) {
        console.log("Failed to find callback func for " + e.data.id);
        console.dir(e);
        return;
      }

      var id = e.data.id;
      var hash = e.data.hash;

      console.log("Hashed: " + id + " - " + hash);
      callbackFunc(hash);
      delete rushaCallbacks[id];
    });
  }

  // Allow passing objects which have a Data() method.
  var data = file;
  if (typeof(file.Data) === 'function') {
    data = file.Data();
  }

  // Keep track of callbacks inside of Worker.
  var id = Math.random();
  rusha.postMessage({id: id, data: data});
  rushaCallbacks[id] = callback;
};

