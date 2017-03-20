var ProgressEvent = function(e, startTime) {
  var loaded = e.loaded;
  var total = e.total;
  var time = e.timeStamp;

  this.speed = function() {
    if ( startTime === undefined ) {
      return "Unknown";
    }

    var durationSeconds = Math.floor((time - startTime)/1000);
    var bytesPerSecond = loaded / durationSeconds;

    return filesize(bytesPerSecond) + "/S";
  };

  this.percent = function() {
    var val = loaded / total;

    if ( isNaN(val) ) {
      return 0;
    } else {
      return val;
    }
  };

  this.percentage = function() {
    return (this.percent() * 100).toFixed(2) + "%";
  };
};
