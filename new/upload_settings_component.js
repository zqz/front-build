var UploaderSettingsComponent = function(uploader) {
  var settings = uploader.settings;

  var checkBox = function(name, initialValue, onChange) {
    var currentValue = initialValue;

    var update = function() {
      if (currentValue) {
        box.classList.add('active');
      } else {
        box.classList.remove('active');
      }
    };

    var onClick = function() {
      currentValue = !currentValue;
      onChange(currentValue);
      update();
    };

    var box = div({cls:'checkbox', onclick: onClick});
    var element = span({cls: 'checkbox-container'}, name, box);
    update();
    return element;
  };

  var instant = checkBox(
    'Instant Upload',
    settings.instant(),
    settings.setInstant
  );

  var redirect = checkBox(
    'Redirect',
    settings.redirect(),
    settings.setRedirect
  );

  var dom = div({cls: 'settings right'}, instant, redirect);

  //instant upload
  //redirect

  var render = function() {
    return dom;
  };

  return {
    render: render,
  };
};
