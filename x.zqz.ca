var Router = function(container) {
  var routes = {};
  var containter = container;
  var loadedScripts = [];
  var initialLoad = true;

  var loadedScript = function(scriptName) {
    return loadedScripts.indexOf(scriptName) > 0;
  };

  var loadScript = function(scriptName) {
    return new Promise(function(resolve) {
      var name = scriptName;
      var body = document.body;

      if (loadedScript(name)) {
        return resolve();
      }

      var node = script({type: 'text/javascript', src: "/assets/" + scriptName});
      body.appendChild(node);

      node.onload = function() {
        loadedScripts.push(name);
        return resolve();
      };
    });
  };


  var gotoPage = function(path) {
    navigate(path, 'normal');
  };

  var silentGotoPage = function(path) {
    navigate(path, 'silent');
  };

  var onHashChange = function(e) {
    var hash = window.location.hash || window.location.pathname;
    gotoPage(hash);
  };

  var init = function() {
    onHashChange();
  };

  var add = function(path, dependencies, func) {
    routes[path] = {
      deps: dependencies,
      func: func
    };
  };

  var renderComponent = function(componentName, args, callback) {
    var routeInfo = routes[componentName];
    if ( routeInfo === undefined ) {
      return div("no content");
    }

    var scriptsToLoad = [];
    routeInfo.deps.forEach(function(dep) {
      scriptsToLoad.push(loadScript(dep));
    });

    Promise.all(scriptsToLoad).then(function() {
      var loadFunc = new routeInfo.func();
      var component = new loadFunc(args);

      // Set title.
      if (component.title === undefined) {
        console.log(componentName + " has no title");
        window.setSection("");
      } else {
        window.setSection(component.title());
      }

      callback(component);
    });
  };

  // When the user goes back.
  var onpopstate = function(e) {
    if (e.state) {
      navigate(e.state.path, 'silent');
    } else {
      navigate('/', 'silent');
    }
  };

  var pushHistory = function(path) {
    console.log("inserting history " + path);
    window.history.pushState({ "path": path }, path, path);
  };

  var updateHistory = function(path) {
    console.log("updating history " + path);
    window.history.replaceState({ "path": path }, path, path);
  };

  var navigate = function(path, historyType) {
    var url = path.replace(/^(#(\/)?)|(\/)/,'');
    var parts = url.split('/');

    var whereTo = parts[0];
    var args = parts.slice(1);

    H.empty(container);

    renderComponent(whereTo, args, function(component) {
      var node = component.render();
      container.appendChild(node);

      // Call init if it exists
      if (component.init !== undefined) {
        component.init();
      }
    });

    if (!initialLoad) {
      history_path = "/" + whereTo;

      if (args.length > 0) {
        history_path += "/" + args;
      }

      if (historyType === "silent") {
        updateHistory(history_path);
      } else if ( historyType === "normal" ) {
        pushHistory(history_path);
      }
    }

    initialLoad = false;
  };

  window.gotoPage = gotoPage;
  window.silentGotoPage = silentGotoPage;
  window.onpopstate = onpopstate;
  window.addEventListener('hashchange', onHashChange);

  return {
    init: init,
    add: add,
  };
};
