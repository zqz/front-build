var Authentication = function() {
  var api = "http://127.0.0.1:3001/api";

  this.data = function(option) {
    var content = {};
    try {
      content = JSON.parse(localStorage['current_user']);
    } catch(e) {
      content = {};
    }

    return content[option];
  };

  this.username = function() {
    return this.data('username');
  };

  this.loggedIn = function() {
    var user = this.data('id');
    return user !== undefined;
  };

  this.onSuccess = function(data) {
    localStorage['current_user'] = data;
    this.onSuccessCallback(data);
  };

  this.onFailure = function(data) {
    this.onFailureCallback(data);
  };

  this.onStateChange = function(xhr, evt) {
    if (xhr.readyState === 4) {
      var data = xhr.response;
      if (xhr.status === 201) {
        this.onSuccess(data);
      } else {
        if ( xhr.status === 0 ) {
          data = { error: "Failed to connect to backend" };
        }
        this.onFailure(data);
      }
    }
  };

  this.request = function(path, data) {
    var xhr = new XMLHttpRequest();

    xhr.open('POST', api + path)
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.send(JSON.stringify(data));
    xhr.addEventListener('readystatechange', this.onStateChange.bind(this, xhr));
  };

  this.login = function(username, password) {
    this.request('/sessions', {
      username: username,
      password: password
    });
  };

  this.logout = function() {
    localStorage.removeItem('current_user');
  };
};

var AuthenticationComponent = function() {
  var auth = new Authentication();
  var dom = div({cls:'auth'});
  var errors = div({cls:'errors'})

  auth.onSuccessCallback = function(data) {
    this.updateAuth();
  }.bind(this);

  auth.onFailureCallback = function(data) {
    H.empty(errors)
    errors.appendChild(span(data.error));
  }.bind(this);

  var gravatarUrl = function() {
    return "http://gravatar.com/avatar/1f8377ba373028db1c2598a963c9ee2c";
  };

  var gravatarStyle = function() {
    return {
      backgroundImage: "url('" + gravatarUrl() + "')",
      backgroundSize: '100%'
    };
  };

  this.updateAuth = function() {
    H.empty(dom);

    if ( auth.loggedIn() ) {
      var gravatar = span({cls:'gravatar', style:gravatarStyle()});

      var username = span({
        cls:'username', onclick: onUsernameClick.bind(this)
      }, auth.username());

      var settings = span({
        cls:'settings right', onclick: onSettingsClick.bind(this)
      }, icon('build'));

      var logout = span({
        cls:'settings right', onclick: onLogoutClick.bind(this)
      }, icon('exit_to_app'));

      dom.appendChild(div(gravatar, username, logout, settings));
    }
  };

  var onLogoutClick = function() {
    auth.logout();
  };

  var onSettingsClick = function() {
    alert('not implemented');
  };

  var onUsernameClick = function() {
    alert('not implemented');
  };

  this.render = function() {
    this.updateAuth();

    return dom;
  };
};
