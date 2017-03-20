var FileListComponent = function(id) {
  var table = new TableComponent({columns: [
    {name: 'File Name', property: 'name'},
    {name: 'Size', property: 'size', align: 'center'},
    {name: 'Created At', property: 'created_at', align: 'right'},
    {name: 'Options', property: 'options', align: 'right'}
  ]});

  var fileList = new FileList(0, 150);
  var pagination = div("pagination");
  var dom = div({id: 'files'});

  var filesLoaded = function(files) {
    H.empty(dom);

    var filez = [];

    var downloadLink = function(slug) {
      return function() {
        window.gotoPage('#file/' + slug);
        console.log(url);
      };
    };

    for(var i = 0; i < files.length; i++) {
      var file = files[i];
      var showFile = div({onclick: downloadLink(file.slug)}, file.name.slice(0, 50));

      var fileEntry = {
        name: showFile,
        size: filesize(file.size),
        created_at: localized_date(file.created_at),
        options: 'DEL HIDE'
      };

      filez.push(fileEntry);
    }

    dom.appendChild(table.render(filez));
    dom.appendChild(pagination);
  };

  fileList.onLoad = filesLoaded.bind(this);
  fileList.fetch();

  return {
    title: function() {
      return 'files';
    },
    render: function() {
      return dom;
    }
  };
};
