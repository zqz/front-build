// TODO: Come up with an explanation for why this exists as it does.
var UploadHandler = function(file, worker) {
  var id = Math.random();
  file.id = id;

  // Not used...
  var stateString = function(stateInt) {
    var states = [
      'incomplete',
      'processing',
      'finished'
    ];

    if (stateInt === null) {
      return 'new';
    }

    return states[stateInt];
  };

  // responsible for changing file data.
  var onmessage = function(type, payload) {
    switch(type) {
      case 'file:created':
        file.file_id = payload.id;
        break;
      case 'file:hashed':
        file.hash = payload;
        break;
      case 'file:state':
        file.file_id = payload.id;
        file.state = payload.state;

        var chunks_needed = payload.chunks_needed;
        var chunks_received = payload.chunks_received;

        // The number of chunks the server is missing.
        if (chunks_needed !== undefined) {
          file.chunks_needed = chunks_needed;
        }

        // The hashes of the chunks the server has received.
        if (chunks_received !== undefined) {
          file.chunks_received = chunks_received;
        }

        console.log("setting state", file.state);
        break;
      case 'file:uploading':
        file.state = 'uploading';
        break;
      case 'file:finished':
        file.state = 'finished';
        file.slug = payload.slug;
        break;
      default:
        console.log("Ignoring", type);
        break;
    }
  };

  var emit = function(type, payload) {
    worker.send({id: id, type: type, payload: payload});
  };

  return {
    add: function() {
      emit('add', file);
    },
    start: function() {
      emit('start', file);
    },
    remove: function() {
      emit('remove', file);
    },
    onmessage: onmessage,
    file: file
  };
};
