var FileList = function(page, per_page) {
  var API_URL  = '/api/v1/files';
  var files    = [];

  // Overwrite this
  this.onLoad = function() { };

  this.fetch = function() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', API_URL + '?per_page=' + per_page + '&page=' + page);
    xhr.addEventListener('readystatechange', onFetch.bind(this, xhr));
    xhr.send();
  };

  var onFetch = function(xhr) {
    if (xhr.readyState === 4) {
      if(xhr.status === 200) {
        var response = JSON.parse(xhr.response);
        this.onLoad(response);
      }
    }
  };
};
