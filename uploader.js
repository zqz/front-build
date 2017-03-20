var Uploader = function() {
  // List of files in the queue.
  var files = [];
  // List of chunks currently being uploaded.
  var uploading = [];
  // List of chunks for all uploads.
  var chunks = [];
  // How many chunks will be uploaded at once.
  var concurrency = 5;
  // Web worker for calculating SHA hashes.
  var sha = new Worker('assets/lib/rusha.js');

  // Consumes hash calculated events from SHA1 Web Worker.
  sha.addEventListener('message', function(evt) {
    id = evt.data.id;
    hash = evt.data.hash;

    for(var i = 0; i < files.length; i++) {
      if (files[i].id() == id) {
        files[i].onHashCalculated(hash);
      }
    }

    console.log(evt);
  }.bind(this));

  // Calculates the hash of a blob, result available in the sha 'message'
  // event handler (which should be directly above this).
  this.calculateBlobHash = function(id, blob) {
    sha.postMessage({id: id, data: blob});
  };

  // Are there any files in the uploader?
  this.hasFiles = function() {
    return files.length > 0;
  };

  // Removes all chunks specified.
  this.removeChunks = function(chunksToRemove) {
    chunks = U.filter(chunks, function(c) {
      return chunksToRemove.indexOf(c) < 0;
    });
  };

  // Removes all files specified.
  this.removeFiles = function(filesToRemove) {
    // First remove all chunks for the files.
    filesToRemove.forEach(function(f) {
      this.removeChunks(f.chunks());
    }.bind(this));

    files = U.filter(files, function(f) {
      return filesToRemove.indexOf(f) < 0;
    });
  };

  // Remove all files in uploader.
  this.removeAll = function() {
    this.removeFiles(files);
  };

  // Removes a single file.
  this.removeFile = function(file) {
    this.removeFiles([file]);
  };

  // Starts uploading all files.
  this.start = function() {
    console.log("starting", chunks.length);

    for ( var i = 0; i < chunks.length; i++ ) {
      var c = chunks[i];
      console.log("starting chunk: ", i, c.Hash())

      if ( c.isUploading() || c.isFinished() ) {
        console.log("skipping", i, "finish or uploading")
        continue;
      }

      if ( c.isQueued() ) {
        if ( !this.startChunk(c) ) {
          break;
        }
      }
    }
  };

  // Adds a file to the uploader.
  this.addFile = function(file) {
    files.push(file);
    this.calculateBlobHash(file.id(), file.blob());
  };

  this.addChunks = function(newChunks) {
    var chunksToBeHashed = [];
    for ( var i = 0; i < newChunks.length; i ++ ) {
      var c = newChunks[i];

      // Don't add chunk twice.
      if ( chunks.indexOf(c) > 0 ) {
        console.log("chunk already in queue");
        continue;
      }

      chunksToBeHashed.push(
        new Promise(function(resolve) {
          var thenewchunk = c;
          SHA1(c, function(chunk, hash) {
            chunk.SetHash(hash);
            chunks.push(chunk);
            console.log("HASHED", chunk.Hash())
            return resolve();
          }.bind(this, c));
        })
      );
    }

    var starty = this.start.bind(this);
    Promise.all(chunksToBeHashed).then(function() {
      console.log("STARTING")
      console.dir(chunks)
      // WEIRD - why do i start here?
      starty();
    });
  };

  this.chunksFinished = function() {
    var count = 0;

    for ( var i = 0; i < chunks.length; i++ ) {
      if ( chunks[i].isFinished() ) {
        count += 1;
      }
    }

    return count;
  };

  this.chunksInProgress = function() {
    var count = 0;

    for ( var i = 0; i < chunks.length; i++ ) {
      if ( chunks[i].isUploading() ) {
        count += 1;
      }
    }

    return count;
  };

  this.totalChunks = function() {
    return chunks.length;
  };

  this.startChunk = function(chunk) {
    console.log("starting", chunk.Hash());
    if ( this.chunksInProgress() >= concurrency ) {
      console.log("cannt upload more than " + concurrency + " chunks at once");
      return false;
    }

    if ( chunk.isUploading() ) {
      console.log(chunk);
      console.log("chunk is already uploading");
      return false;
    }

    // Add callbacks
    chunk.addErrorCallback(this.onChunkError.bind(this, chunk));
    chunk.addProgressCallback(this.onChunkProgress.bind(this, chunk));
    chunk.addFinishCallback(this.onChunkFinished.bind(this, chunk));
    chunk.addStartCallback(this.onChunkStarted.bind(this, chunk));
    chunk.upload();

    return true;
  };


  this.onChunkProgress = function(chunk, progress) {

  };

  this.onChunkStarted = function(chunk) {

  };

  this.onChunkError = function(chunk) {
    console.log("chunk errored");
    this.start();
  };

  this.onChunkFinished = function(chunk) {
    console.log("chunk finished");
    this.start();
  };
};
