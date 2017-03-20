var PasteHack = function() {
  // ContentEditable Hack for consuming paste events in FF.
  var dom = div({id: 'paste-hack', contentEditable: true});
  var KEYCODE_V = 86; // The KevEvent for the 'V' key.

  var onPaste = function(e) {
    var files = e.clipboardData.items || [];

    for (var i = 0; i < files.length; i++) {
      var blob = files[i].getAsFile();

      if (blob === null) {
        continue;
      }

      var pastedFile = {
        name: 'pasted_file',
        blob: blob,
      };

      uploader.add(pastedFile);
    }
  };

  // This is a hack for Firefox.
  // In order to handle paste events a content-editable div needs to be inserted
  // into the page and it must be focused before the user pastes (with ctrl-v)
  // so that it is possible to detect the content of their paste. Gross.
  var onKeyDown = function(e) {
    if (e.ctrlKey && e.keyCode == KEYCODE_V) {
      document.body.appendChild(pasteHack);
      pasteHack.focus();
      console.log("ctrl v pressed");
    }
  };

  var onKeyUp = function(e) {
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

          var file = {
            name: 'pasted_file',
            blob: blob
          };

          uploader.add(file);
        }
      }

      H.empty(pasteHack);
    }
  };

  var onDragOver = function(e) {
    e.stopPropagation();
    e.preventDefault();
  };

  var onDragLeave = function(e) {
    e.stopPropagation();
    e.preventDefault();
  };

  var onDrop = function(e) {
    e.stopPropagation();
    e.preventDefault();

    var files = e.target.files || e.dataTransfer.files;
    for (var i = 0; i < files.length; i++) {
      var f = files[i];

      var file = {
        name: f.name,
        blob: f
      };

      uploader.add(file);
    }
  };

  return {
    keydown: onKeyDown,
    keyup: onKeyUp,
    paste: onPaste,
    dragover: onDragOver,
    dragleave: onDragLeave,
    drop: onDrop
  };
};

var p = new PasteHack();
document.addEventListener('keydown', p.keydown);
document.addEventListener('keyup', p.keyup);
document.addEventListener('paste', p.paste);
document.body.addEventListener('dragover', p.dragover);
document.body.addEventListener('dragleave', p.dragleave);
document.body.addEventListener('drop', p.drop);
