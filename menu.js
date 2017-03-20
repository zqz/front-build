var Menu = function() {
  var items = [];
  var menu = span({cls:'menu'});
  var auth = new Authentication();

  var addLink = function(text, path) {
    var item = span({cls:'item', url: path}, text);

    item.onclick = function(e) {
      window.gotoPage(path);
    };

    items.push(item);
  };

  var addText = function(text) {
    var item = span({cls:'item'}, text);
    items.push(item);
  };

  var update = function() {
    items = [];

    addLink("All Files", "/files");
    addLink("Upload", "/upload2");

    //     if ( auth.loggedIn() ) {
    //       addLink("Sign Out", "/logout");
    //       addText(auth.username());
    //     } else {
    //       addLink("Sign In", "/login");
    //     }
  };

  return {
    update: update, // why is this eeeexposed?
    render: function() {
      update();
      H.empty(menu);

      for (var i = 0; i < items.length; i++) {
        menu.appendChild(items[i]);
      }

      return menu;
    }
  };
};

