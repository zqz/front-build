var RegistrationComponent = function() {
  var fieldNodes = {};

  this.title = function() {
    return "join";
  };

  var baseValidation = function(node, valid) {
    H.empty(node)

    if (valid == true ) {
      node.appendChild(icon('check'));
    } else {
      node.appendChild(icon('cancel'));
    }
  };

  var passwordValidation = function(validator, input, evt) {
    var password = document.getElementById('registration-input-password').value;
    var password_confirmation = document.getElementById('registration-input-password_confirmation').value;
    var valid = true;

    if (password.length <= 5 || password != password_confirmation) {
      valid = false;
    }

    baseValidation(validator, valid);
  };

  var usernameValidation = function(validator, input, evt) {
    var username = input.value;
    var valid = true;

    if (username.length <= 3 || username.length > 12 || username.indexOf(' ') > 0) {
      valid = false;
    }

    baseValidation(validator, valid);
  };

  var fields = [
    { name: 'username', text: 'Username', type: 'text', validator: usernameValidation },
    { name: 'password', text: 'Password', type: 'text', required: true },
    { name: 'password_confirmation', text: 'Password Confirmation', validator: passwordValidation, type: 'text', required: true },
    { name: 'email', text: 'Email', type: 'text', required: true },
    { name: 'phone', text: 'Phone', type: 'text', required: false},
  ];

  this.renderFields = function() {
    var renderedFields = [];
    fields.forEach(function(field) {
      var errors = field.errors || [];

      var fieldText = div({cls: 'input-name'}, field.text);
      var fieldInput = input({
        id: 'registration-input-' + field.name,
        name: field.name, type: field.type, required: field.required
      });
      var fieldValid = span({cls: 'valid'});

      if ( field.validator != undefined ) {
        fieldInput.addEventListener('input', field.validator.bind(this, fieldValid, fieldInput));
      }

      var fieldContainer = div({cls: 'input-row'}, fieldText, fieldInput, fieldValid);

      var nodeInfo = {
        text: fieldText,
        input: fieldInput,
        container: fieldContainer
      };

      fieldNodes[field.name] = nodeInfo;

      renderedFields.push(fieldContainer);
    }.bind(this));

    return div(renderedFields);
  };

  this.onSubmit = function() {
    console.log("username: " + fieldNodes.username.input.value);
    console.log("registering...");
  }.bind(this);

  this.render = function() {
    var notice = div({cls: 'notice'}, "You are signing up for zqz.");
    var submit = div({cls: 'btn large', onclick: this.onSubmit}, 'Register');
    var container = div({cls: 'registration'}, notice, this.renderFields(), submit);
    return container;
  };
};

