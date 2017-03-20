// {
//   columns: [
//    {name: 'ID', property: 'id'},
//    {name: 'd
//

var TableComponent = function(options) {
  var columns = options.columns || [];

  var renderHeader = function() {
    var thead = div({cls:'thead'});

    for (var i = 0; i < columns.length; i++) {
      var property = columns[i].property;
      var name = columns[i].name;
      var align = columns[i].align;

      var column = div({
        cls:'th ' + property,
        style: { textAlign: align }
      }, name);

      thead.appendChild(column);
    }

    return thead;
  };

  var renderBody = function(items) {
    var tbody = div({cls:'tbody'});

    for (var i = 0; i < items.length; i++) {
      var tr = div({cls: 'tr'});
      var item = items[i];

      for(var j = 0; j < columns.length; j++) {
        var property = columns[j].property;
        var align = columns[j].align;
        var value = item[property];

        if (typeof value === "function") {
          value = value();
        }

        var column = div({
          cls: 'td ' + property,
          style: { textAlign: align }
        }, value);
        tr.appendChild(column);
      };

      tbody.appendChild(tr);
    }

    return tbody;
  };

  this.render = function(items) {
    var header = renderHeader();
    var body = renderBody(items);
    var table = div({cls: 'table'}, header, body);

    return table;
  };
}
