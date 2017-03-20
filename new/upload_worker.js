// Events Emitted by this Worker:
// file:started
// file:chunked
// file:hashed
// file:paused
// file:progress
// file:resumed
// file:finished
// chunk:created
// chunk:state
// chunk:hashed
// chunk:progress
// chunk:started
// chunk:cancelled
// chunk:errored
// chunk:finished
// todo - create file on server if not exist.
//      - upload chunks
//      - send events
//      - clean this up
//

var UploadCommands = function(file, emit) {
  // Creates a "file" on the server. This is really just a container id for us
  // to upload chunks to.
  var createFile = function() {
    var url = '/api/v1/files';

    var payload = {
      name: file.name,
      size: file.blob.size,
      type: file.blob.type,
      hash: file.hash,
      num_chunks: file.num_chunks
    };

    var createCallback = function(status, response) {
      if (status === 201) {
        emit('file:created', response);
        uploadChunks();
      } else {
        console.log("file already exists..");
      }
    };

    postJSON(url, payload, createCallback);
  };

  var fetchStatus = function() {
    var url = '/api/v1/check/' + file.hash;

    var existsCallback = function(status, response) {
      if (status === 404) {
        console.log("file does not exist");
      } else if ( status ===  200 ) {
        emit('file:state', response);

        if (response.state === 'finished') {
          emit('file:finished', response);
        }

        console.log("file exists");
      }
    };

    if (file.instant === true) {
      startFile();
    }

    get(url, existsCallback);
  };

  var startFile = function() {
    if (file.state === 'finished') {
      console.log("File already uploaded");
      finishFile();
      return;
    }

    if (file.state === 'new') {
      console.log("creating file");
      createFile();
      return;
    }

    resumeFile();
  };

  var resumeFile = function() {
    console.log("resuming");
    uploadChunks();
  };

  var uploadChunks = function() {
    var chunkPromises = chunkFile();

    Promise.all(chunkPromises).then(function() {
      emit('file:chunked');
      startUpload();
    });
  };

  // This chunks the file and after all the chunks have been hashed, starts the
  // upload process. This should be moved somewhere else.
  var chunkFile = function() {
    var chunkSize = file.chunk_size;
    var numChunks = file.num_chunks;
    var chunkPromises = [];

    if (file.chunks !== undefined && file.chunks.length > 0) {
      console.log("File Already Chunked!");
      return;
    }

    file.chunks = [];
    for(var i = 0; i < numChunks; i++) {
      var dataStart = i * chunkSize;
      var dataEnd = (i + 1) * chunkSize;

      var blob = file.blob.slice(dataStart, dataEnd);
      var chunk = {
        id: Math.random(),
        file_id: file.file_id,
        position: i,
        blob: blob,
      };

      file.chunks.push(chunk);

      // We need to track when we've added all chunks.
      var chunkPromise = addChunk(chunk);
      chunkPromises.push(chunkPromise);
    }

    return chunkPromises;
  };

  var startUpload = function() {
    emit('file:uploading');

    for (var i = 0; i < file.chunks.length; i++) {
      var c = file.chunks[i];
      uploadChunk(c);
    }
  };

  var uploadChunk = function(c) {
    if (c === undefined) {
      console.log("chunk is null?");
      return;
    }

    if (c.file_id === undefined) {
      console.log("no file id for what reason?!");
      console.log(file);
      return;
    }

    var url = '/api/v1/chunks?file_id=' + c.file_id + '&position=' + c.position + '&hash=' + c.hash + '&ws_id=' + window.getID();
    // var url = '/api/v1/files/' + c.file_id + '/chunks/' + c.position + '/' + c.hash + '/' + window.getID();
    var chunkProgress = function(progress) {

      emit("chunk:progress", { chunk: c, progress: progress });
      console.log("progress");
      console.dir(progress);
    };

    var chunkFinished = function(response) {
      emit("chunk:finished", c);
      console.log("chunk finished");
    };

    post(url, c.blob, chunkProgress, chunkFinished);
  };

  var addChunk = function(chunk) {
    return new Promise(function(resolve) {
      SHA1(chunk.blob, function(hash) {
        chunk.hash = hash;
        emit('chunk:created', chunk);
        return resolve();
      });
    });
  };

  // When a file is added we must hash it so that we can check
  // if it has been uploaded before.
  var addFile = function() {
    emit('file:added', file);

    SHA1(file.blob, function(hash) {
      emit('file:hashed', hash);
      fetchStatus();
    });
  };

  var removeFile = function() {
    emit('file:removed', file);
  };

  return {
    addFile: addFile,
    removeFile: removeFile,
    startFile: startFile
  };
};

var UploadWorker = function(callback) {
  // Post a message back to the callback.
  var postMessage = function(payload) {
    callback(payload);
  };

  var onmessage = function(e) {
    var id = e.id;
    var type = e.type;
    var file = e.payload;

    // Not sure how much I like defining emit here.
    var emit = function(type, payload) {
      postMessage({id: id, type: type, payload: payload});
    };

    var commands = new UploadCommands(file, emit);

    switch(type) {
      case 'add':
        commands.addFile();
        break;
      case 'remove':
        commands.removeFile();
        break;
      case 'status':
        commands.checkStatus();
        break;
      case 'start':
        commands.startFile();
        break;
      default:
        console.log("Received unrecognized command: " + type);
        break;
    }
  };

  return {
    send: onmessage
  };
};

var FileChunker = function(file) {
  var chunkSize = 1;
  var blob = file.blob;
  var start = function() { };
};
