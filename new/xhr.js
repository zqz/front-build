var post = function(url, data, progress, callback, options) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);

  if (progress !== null) {
    xhr.upload.onprogress = function(evt) {
      progress({
        percent: Math.ceil((evt.loaded / evt.total) * 100),
        send: evt.loaded,
        total: evt.total
      });
    };
  }

  if (options !== undefined) {
    var headers = options.headers;

    if (headers !== undefined) {
      for (var k in headers) {
        console.log("Setting ", k, "to", headers[k]);
        xhr.setRequestHeader(k, headers[k]);   
      }
    }
  }

  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) { return; } // not the complete state

    var response = {};
    if (xhr.response !== "") {
      response = JSON.parse(xhr.response);
    }

    callback(xhr.status, response);
  };
  xhr.send(data);
};

var postJSON = function(url, data, callback) {
  var headers = { 'Content-Type': 'application/json' };

  post(
    url,
    JSON.stringify(data), // json
    null, // no need for progress event
    callback,
    { headers: headers }
  );
};

var get = function(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) { return; } // not the complete state

    var response = {};
    if (xhr.response !== "") {
      response = JSON.parse(xhr.response);
    }

    callback(xhr.status, response);
  };
  xhr.send();
};


var deleteRequest = function(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('DELETE', url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) { return; } // not the complete state

    var response = {};
    if (xhr.response !== "") {
      response = JSON.parse(xhr.response);
    }

    callback(xhr.status, response);
  };
  xhr.send();
};

