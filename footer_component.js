var FooterComponent = function() {
  var info = span('foo');
  var ws = span({cls: 'ws disconnected'}, ' ⚫');
  var left = div({cls: 'left'}, info, ws);
  var content = div({cls:'right'}, '☃ zqz.ca 2016');
  var dom  = div({id:'footer', cls: 'bar'}, div({cls: 'container'}, left, content));

  window.setDetails = function(string) {
    H.empty(info);
    info.appendChild(span(string));
  };

  window.setConnectionInfo = function() {
    ws.classList.remove('disconnected');
    ws.classList.add('connected');
  };

  return {
    render: function() { return dom; }
  };
};
