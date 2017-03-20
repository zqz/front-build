var FilePreviewComponent = function(file) {
  var container = div({cls: 'preview'});
  var type = file.type();

  var handler = function() {
    var h = {
      'image': imagePreview,
      'text': textPreview
    };

    return h[type];
  };

  var textPreview = function() {
    H.empty(container);
    container.appendChild(
      icon('description')
    );
  };

  var createPreviewImage = function(evt) {
    var image = div({cls: 'image-preview'});
    image.style.backgroundImage= 'url(' + evt.target.result + ')';
    return image;
  };

  var imagePreview = function() {
    var reader = new FileReader();

    reader.onload = function(e) {
      H.empty(container);

      container.appendChild(createPreviewImage(e));
    };

    reader.readAsDataURL(file.originalBlob());
  };

  var updatePreview = function() {
    var handlerFunc = handler();

    if (handlerFunc === undefined) {
      return;
    }

    handlerFunc();
  };

  this.render = function() {
    updatePreview();
    return container;
  };
};

