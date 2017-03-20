function base64toBlob(base64Data, contentType) {
	contentType = contentType || '';
	var sliceSize = 1024;
	var byteCharacters = atob(base64Data);
	var bytesLength = byteCharacters.length;
	var slicesCount = Math.ceil(bytesLength / sliceSize);
	var byteArrays = new Array(slicesCount);

	for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
		var begin = sliceIndex * sliceSize;
		var end = Math.min(begin + sliceSize, bytesLength);

		var bytes = new Array(end - begin);
		for (var offset = begin, i = 0 ; offset < end; ++i, ++offset) {
			bytes[i] = byteCharacters[offset].charCodeAt(0);
		}
		byteArrays[sliceIndex] = new Uint8Array(bytes);
	}
	return new Blob(byteArrays, { type: contentType });
}

function icon(name) {
  var e = document.createElement('i');
  e.classList.add('material-icons');
  e.appendChild(document.createTextNode(name));
  return e;
}

function mime2name(mime) {
  switch (true) {
    case /^image\//.test(mime):
      return 'image';
    case /^audio\//.test(mime):
      return 'music';
    case /^video\//.test(mime):
      return 'video';
    case /^text\/html/.test(mime):
      return 'html';
    case /^text/.test(mime):
      return 'text';
    case /^application\/zip/.test(mime):
      return 'zip';
    case /^application\/x-rar/.test(mime):
      return 'rar';
    case /^application\/pdf/.test(mime):
      return 'pdf';
    case /^application/.test(mime):
      return 'binary';
    default:
      return 'unknown';
  }
}

