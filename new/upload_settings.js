var UploaderSettings = function() {
  var instant = 'uploader:instant';
  var redirect = 'uploader:redirect';

  // fetches value from localStoage, returns false if not found.
  var getValue = function(key) {
    var v = localStorage.getItem(key);
    if (v === null || v === 'false') { return false; }
    if (v === 'true') { return true; }
  };

  var getInstantUpload = function() {
    return getValue(instant);
  };

  var getRedirect = function() {
    return getValue(redirect);
  };

  var setInstant = function(value) {
    localStorage.setItem(instant, value);
  };

  var setRedirect = function(value) {
    localStorage.setItem(redirect, value);
  };

  return {
    setRedirect: setRedirect,
    setInstant: setInstant,
    instant: getInstantUpload,
    redirect: getRedirect,
  };
};
