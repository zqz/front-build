var WS = function() {
  var socket = null;
  var id = null;

  var send = function(data) {
    socket.send(JSON.stringify(data));
  };

  // Commands to send /to/ the server.
  var commands = {
    // register an anonymous client.
    register: function() {
      send({x: 'register', id: Math.random()});
    }
  };

  // Handle events /from/ the server.
  var handlers = {
    register: function(payload) {
      id = payload.id;
      console.log("registering: ", payload.id);
    }
  };

  var onOpen = function(e) {
    var handler = handlers.open;

    if (handlers !== undefined) {
      handler();
    }

    commands.register();
  };

  var onMessage = function(e) {
    var data = JSON.parse(e.data);
    var event = data.e;
    var payload = data.p;

    if (event !== undefined && payload !== undefined) {
      var handler = handlers[event];
      if (handler === undefined) {
        console.log("received unhandled event: ", event);
        console.log("payload:", payload);
        return;
      }

      handler(payload);
    }
  };

  return {
    connect: function() {
      socket = new WebSocket(window.ws_url);
      socket.addEventListener('open', onOpen);
      socket.addEventListener('message', onMessage);
    },

    addHandler: function(event, handlerFunc) {
      handlers[event] = handlerFunc;
    },
    getID: function() {
      return id;
    }
  };
};
