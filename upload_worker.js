var UploadCommands=function(a,b){var k=function(){postJSON("/api/v1/files",{name:a.name,size:a.blob.size,type:a.blob.type,hash:a.hash,num_chunks:a.num_chunks},function(a,f){201===a?(b("file:created",f),d()):console.log("file already exists..")})},h=function(){var c="/api/v1/check/"+a.hash;!0===a.instant&&l();get(c,function(a,c){404===a?console.log("file does not exist"):200===a&&(b("file:state",c),"finished"===c.state&&b("file:finished",c),console.log("file exists"))})},l=function(){"finished"===
a.state?(console.log("File already uploaded"),finishFile()):"new"===a.state?(console.log("creating file"),k()):(console.log("resuming"),d())},d=function(){var c=n();Promise.all(c).then(function(){b("file:chunked");b("file:uploading");for(var c=0;c<a.chunks.length;c++)p(a.chunks[c])})},n=function(){var c=a.chunk_size,b=a.num_chunks,m=[];if(void 0!==a.chunks&&0<a.chunks.length)console.log("File Already Chunked!");else{a.chunks=[];for(var g=0;g<b;g++){var e=a.blob.slice(g*c,(g+1)*c),e={id:Math.random(),
file_id:a.file_id,position:g,blob:e};a.chunks.push(e);e=q(e);m.push(e)}return m}},p=function(c){if(void 0===c)console.log("chunk is null?");else if(void 0===c.file_id)console.log("no file id for what reason?!"),console.log(a);else{var f="/api/v1/chunks?file_id="+c.file_id+"&position="+c.position+"&hash="+c.hash+"&ws_id="+window.getID();post(f,c.blob,function(a){b("chunk:progress",{chunk:c,progress:a});console.log("progress");console.dir(a)},function(a){b("chunk:finished",c);console.log("chunk finished")})}},
q=function(a){return new Promise(function(f){SHA1(a.blob,function(d){a.hash=d;b("chunk:created",a);return f()})})};return{addFile:function(){b("file:added",a);SHA1(a.blob,function(a){b("file:hashed",a);h()})},removeFile:function(){b("file:removed",a)},startFile:l}},UploadWorker=function(a){return{send:function(b){var k=b.id,h=b.type;b=new UploadCommands(b.payload,function(b,d){a({id:k,type:b,payload:d})});switch(h){case "add":b.addFile();break;case "remove":b.removeFile();break;case "status":b.checkStatus();
break;case "start":b.startFile();break;default:console.log("Received unrecognized command: "+h)}}}},FileChunker=function(a){};
