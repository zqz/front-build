var LoginComponent = function(options) {
  var auth = new Authentication();
  var expanded = false;

  var username = input({type:'text'});
  var password = input({type:'password'});

  var onSubmitClick = function() {
    console.log("username" + username.value);
    console.log("password" + password.value);

    auth.login(username.value, password.value);
  };

  var loginGroup = div({cls:'group'}, 'Username', username);
  var passwordGroup = div({cls:'group'}, 'Password', password);

  var submit = div({cls:'submit', onclick: onSubmitClick}, icon('forward'), 'Login');
  var login = div({cls: 'login'}, loginGroup, passwordGroup, submit);
  var loginContainer = div({cls: 'login-container'}, login);

  auth.onFailureCallback = function() {
    app.addError('login', 'Invalid Credentials', 'Failed to login');
  }.bind(this);

  auth.onSuccessCallback = function() {
    app.addError('login', 'Success', 'IS GOO');
  }.bind(this);

  this.title = function() {
    return "login";
  };

  this.init = function() {
    if ( auth.loggedIn() ) {
      app.addError("login", "Redirected to Dashboard", "You're already logged in!");
      window.silentGotoPage('/', true)
    }
  }

  this.render = function() {
    return loginContainer;
  };
};
