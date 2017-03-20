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

  if (!rushaLoaded) {
    rusha = new Worker('assets/lib/rusha.js');
    rushaLoaded = true

    rusha.addEventListener('message', function(e) {
      var callbackFunc = rushaCallbacks[e.data.id];
      if (callbackFunc === undefined) {
        console.log("Failed to find callback func for " + e.data.id);
        console.dir(e);
        return
      }

      var id = e.data.id;
      var hash = e.data.hash;

      console.log("Hashed: " + id + " - " + hash)
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


var UploaderComponent = function() {
  var uploader = new Uploader();
  // The buttons for the uploader (start, pause, stop, etc..)
  var buttons   = div({cls: 'options btn-group'});
  // The list of files in the upload queue.
  var queue     = div({id: 'queue', cls: 'list'});
  // The hidden file input form used for fetching files.
  var fileInput = input({cls: 'upload-input', type:'file', multiple:'true'});
  // The entire uploader dom. This is what is appended to root.
  var dom       = div({id: 'uploader'}, buttons, queue, fileInput);

  // ContentEditable Hack for consuming paste events in FF.
  var pasteHack = div({id: 'paste-hack', contentEditable: true});

  var KEYCODE_V = 86;

  this.title = function() { return "upload" };

  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.keyCode == KEYCODE_V) {
      document.body.appendChild(pasteHack);
      pasteHack.focus();
      console.log("ctrl v pressed");
    }
  }.bind(this));

  document.addEventListener('paste', function(e) {
    var files = e.clipboardData.items || [];

    for (var i = 0; i < files.length; i++) {
      var blob = files[i].getAsFile();

      if (blob === null) {
        continue;
      }

      this.addPastedFile(blob);
    }
  }.bind(this));

  document.addEventListener('keyup', function(e) {
    if (e.keyCode == KEYCODE_V) {
      var pastedItems = pasteHack.children;

      for (var i = 0; i < pastedItems.length; i++) {
        var item = pastedItems[i];

        // only interested in images
        if (item.tagName.toLowerCase() != "img") {
          continue;
        }

        var src = item.src;

        var base64regexp = new RegExp(/^data:(image\/\w+);base64,/);
        var matches = src.match(base64regexp);

        // no match means this was not a base64 paste.
        if (matches !== null) {
          var type = matches[1];
          var data = src.replace(base64regexp, "");
          var blob = base64toBlob(data, type);

          this.addPastedFile(blob);
        }
      }

      H.empty(pasteHack);
    }

  }.bind(this));

  document.body.ondragover = function(e) {
    e.stopPropagation();
    e.preventDefault();
  };

  document.body.ondragleave = function(e) {
    e.stopPropagation();
    e.preventDefault();
  };

  document.body.ondrop = function(e) {
    e.stopPropagation();
    e.preventDefault();
    var files = e.target.files || e.dataTransfer.files;
    for (var i = 0; i < files.length; i++) {
      var x = files[i];
      var f = new File(x);
      this.addFile(f);
      console.log(f);
    }
  }.bind(this);

  // Changes visible buttons for the uploader by rebuilding the button dom.
  this.updateButtons = function() {
    H.empty(buttons);

    buttons.appendChild(
      span({cls:'btn', onclick: this.onBrowse.bind(this)}, icon('folder'), 'Browse')
    );

    if (uploader.hasFiles()) {
      buttons.appendChild(
        span({cls:'btn', onclick: this.onStartAll.bind(this)}, icon('play_arrow'), 'Start All')
      );

      buttons.appendChild(
        span({cls:'btn', onclick: this.onRemoveAll.bind(this)}, icon('clear'), 'Remove All')
      );
    }
  };

  // Opens the file browse dialog.
  this.onBrowse = function() {
    fileInput.click();
  };

  // Handler for when the USER removes all uploads.
  this.onRemoveAll = function() {
    uploader.removeAll();
    H.empty(queue);
    this.updateButtons();
  };

  // Handler for when the USER starts all uploads.
  this.onStartAll = function(evt) {
    alert('not implemented');
    // uploader.start();
  };

  // Handler for when file input changes.
  this.onChange = function(evt) {
    var files = evt.target.files;

    for (var i = 0; i < files.length; i++) {
      this.addRawFile(files[i]);
    }

    fileInput.value = '';
    this.updateButtons();
  };

  // Adds a blob to the uploader.
  this.addRawFile = function(blob) {
    this.addFile(
      new File(blob)
    );
  };

  // Pasted blobs have no name. Set one.
  this.addPastedFile = function(blob) {
    if (blob.name === undefined) {
      blob.name = "Pasted File";
    }

    this.addRawFile(blob);
  };

  // Adds a file to the uploader.
  this.addFile = function(file) {
    uploader.addFile(file);

    var ufc = new FileComponent(file);
    var ufc_node = ufc.render();

    // Event Handler which gives chunks to the Uploader to manage.
    ufc.startChunks = function(chunks) {
      uploader.addChunks(chunks);
      console.log("adding " + chunks.length + " chunks");
    }.bind(this);

    // Event Handler for removing rhe file from the Uploader.
    ufc.onRemove = function() {
      uploader.removeFile(file);
      queue.removeChild(ufc_node);
    }.bind(this);

    queue.appendChild(ufc_node);
  };

  this.render = function() {
    this.updateButtons();
    fileInput.onchange = this.onChange.bind(this);
    return dom;
  };
  // Removes a file from the Uploader.
  this.removeFile = function(file) {
    if ( file === undefined ) { return; }

    // WEIRD - needs fixing. need to implement removeChunks/removeFiles which
    // returns the modified array.
    // remove chunks from our global list.
    var chunks = file.chunks();
    for ( var i = 0; i < chunks.length; i++ ) {
      this.removeChunk(chunks[i]);
    }

    // remove file
    files = U.filter(files, function(g) {
      return g != file;
    });

    this.updateButtons();
  };
};
