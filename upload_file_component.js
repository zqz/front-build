var FileComponent = function(file, actions) {
  var buttons  = div({cls: 'btn-group'});
  var label    = div({cls: 'label'});
  var info     = div({cls: 'info'});
  var chunks   = div({cls: 'chunks'});
  var progress = span({cls: 'progress'});
  var preview  = new FilePreviewComponent(file);

  var infoOpen = true;

  file.updateViewCallback = function() {
    this.updateLabel(); // not needed
    this.updateInfo();
    this.updateButtons();
  }.bind(this);

  file.progressCallback = function(progressEvent) {
    this.updateProgress(progressEvent);
  }.bind(this);

  file.finishedCallback = function() {
    this.updateInfo();
    this.updateButtons();
  }.bind(this);

  this.updateProgress = function(progressEvent) {
    H.empty(progress);

    progress.appendChild(
      document.createTextNode(
        progressEvent.speed() + " " + progressEvent.percentage()
      )
    );
  };

  this.stateString = function() {
    if ( file.isInitialized() ) {
      return "INIT";
    }

    if ( file.isIncomplete() ) {
      return "INCOMPLETE";
    }

    if ( file.isUploading() ) {
      return "UPLOADING";
    }

    if ( file.isCanceled() ) {
      return "CANCELED";
    }

    if ( file.isQueued() ) {
      return "QUEUED";
    }

    if ( file.isPaused() ) {
      return "PAUSED";
    }

    if ( file.isFinished() ) {
      return "FINISHED";
    }
  };

  this.updateLabel = function() {
    H.empty(label);

    label.appendChild(
      div({cls:'name'}, file.name())
    );
  };

  this.updateInfo = function() {
    H.empty(info);

    var plaintext = div({cls: 'plaintext'},
      div('SHA1:   ', file.hash()),
      div('SIZE:   ', file.size()),
      div('STATE:  ', this.stateString()),
      div('CHUNKS: ', file.chunks().length + ' / ' + file.numChunks())
    );

    info.appendChild(plaintext);

    if (file.isUploading()) {
      info.appendChild(chunks);
    }

    if (file.isFinished()) {
      info.appendChild(
        document.createTextNode("finished")
      );
    }
  };

  // Handler for Start button
  this.clickStart = function() {
    file.start(function() {
      // chunkFile sets state to started
      var fileChunks = file.chunkFile();
      var numChunks = fileChunks.length;

      for ( var i = 0; i < numChunks; i++ ) {
        var chunk = fileChunks[i];
        var chunk_dom = new ChunkComponent(chunk);
        chunks.appendChild(chunk_dom.render());
      }

      this.startChunks(fileChunks);
      this.updateInfo();
      this.updateButtons();
    }.bind(this));

    this.updateInfo();
    this.updateButtons();
  };

  // Handler for Pause button
  this.clickPause = function() {
    file.pause();
    this.updateButtons();
  };

  // Handler for Resume button
  this.clickResume = function() {
    file.resume();
    this.updateButtons();
  };

  // Handler for Stats button
  this.clickToggleStats = function() {
    alert("Not Implemented");
  };

  // Handler for Cancel button
  this.clickCancel = function() {
    file.cancel();
    this.updateButtons();
  };

  // Handler for Remove button
  this.clickRemove = function() {
    file.cancel();
    this.onRemove();
  };

  this.updateButtons = function() {
    // remove all buttons
    H.empty(buttons);

    buttons.appendChild(
      span({cls:'btn stats pull-left', onclick: this.clickToggleStats.bind(this)}, icon('info'), 'Stats')
    );

    if (file.isQueued() || file.isIncomplete()) {
      buttons.appendChild(
        span({cls:'btn remove', onclick: this.clickRemove.bind(this)}, icon('clear'), 'Remove')
      );

      if (file.canStart()) {
        buttons.appendChild(
          span({cls:'btn start', onclick: this.clickStart.bind(this)}, icon('file_upload'), 'Upload')
        );
      }
    }

    if (file.isUploading()) {
      buttons.appendChild(
        span({cls:'btn pause', onclick: this.clickPause.bind(this)}, icon('pause'), 'Pause')
      );
      buttons.appendChild(
        span({cls:'btn cancel', onclick: this.clickCancel.bind(this)}, icon('cancel'), 'Cancel')
      );
    }

    if (file.isPaused()) {
      buttons.appendChild(
        span({cls:'btn resume', onclick: this.clickResume.bind(this)}, icon('play_arrow'), 'Resume')
      );
      buttons.appendChild(
        span({cls:'btn cancel', onclick: this.clickCancel.bind(this)}, icon('cancel'), 'Cancel')
      );
    }

    if (file.isCanceled()) {
      buttons.appendChild(
        span({cls:'btn restart', onclick: this.clickStart.bind(this)}, icon('file_upload'), 'Restart')
      );
      buttons.appendChild(
        span({cls:'btn remove', onclick: this.clickRemove.bind(this)}, icon('clear'), 'Remove')
      );
    }

    if (file.isFinished()) {
      buttons.appendChild(
        span({cls:'btn remove', onclick: this.clickRemove.bind(this)}, icon('clear'), 'Remove from list')
      );
    }
  };

  this.render = function() {
    this.updateLabel();
    this.updateInfo();
    this.updateButtons();

    var container = div({cls: 'container'}, label, info, buttons);
    return (
      div({cls: 'upload-file'}, preview.render(), container)
    );
  };
};

