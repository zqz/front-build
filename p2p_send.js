var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;

// I don't think is needed since I'm only going to use a DataChannel

var P2PSender = function(connection, callbacks) {
  // Websockets for managing signaling.
  var ws = null;
  var channel = null;

  var wsSend = function(raw) {
    var msg = JSON.stringify(raw);
    ws.send(msg);
  }

  var wsURI = function() {
    var loc = window.location;
    var proto = loc.protocol === 'https:' ? 'wss:' : 'ws:';
    var path = "/api/v1/p2p/signaling";
    return proto + "//" + loc.host + path;
  };

  var initWebsock = function() {
    console.log("Initializing Websocket");
    var uri = wsURI();
    ws = new WebSocket(uri);

    ws.onopen = onWebsockOpen.bind(this);
    ws.onmessage = onWebsockMessage.bind(this);
    ws.onclose = onWebsockClose.bind(this);
  };

  var onWebsockClose = function() {
    console.log("onWebsockClose");
  };

  var onWebsockOpen = function() {
    console.log("onWebsockOpen");
    initWebRTC();
  };

  var onWebsockMessage = function(evt) {
    console.log("onWebsockMessage");
    console.log(evt);

    var msg = JSON.parse(evt.data);
    console.log(msg)

    if (msg['msg'] === 'created') {
      console.log("Session Created: " + msg.id);
      callbacks.sessionCreated(msg.id);
    }

    if (msg['type'] === 'answer') {
      onSessionAnswerReceived(msg);
    }
  };



  var initDataChannel = function() {
    channel = connection.createDataChannel(
      'zqz-p2p', {}
    );

    channel.onopen = onDataChannelOpen.bind(this);
    channel.onclose = onDataChannelClose.bind(this);
    channel.onmessage = onDataChannelMessage.bind(this);
    channel.onerror = onDataChannelError.bind(this);

    window.channel = channel;
  };

  var onDataChannelError = function(evt) {
    console.log("onDataChannelError");
    console.log(evt);
  };

  var onDataChannelOpen = function(evt) {
    callbacks.connect();
    console.log("onDataChannelOpen");
    console.log(evt);
  };

  var onDataChannelClose = function(evt) {
    console.log("onDataChannelClose");
    console.log(evt);
    callbacks.disconnect();
  };

  var onDataChannelMessage = function(evt) {
    console.log("onDataChannelMessage");
  };



  var onICECandidate = function(evt) {
    console.log("onICECandidate");
    var candiate = evt.candidate;
    if ( typeof candidate == 'undefined' ) {
      console.log("sending local");
      wsSend(connection.localDescription);
    }
    console.log(evt);
  };

	var onSignalingStateChange = function(state) {
    console.info('signaling state change:', state)
  };

  var onICEConnectionStateChange = function(state) {
    console.info('ice connection state change:', state)
  };

  var onICEGatheringStateChange = function(state) {
    console.info('ice gathering state change:', state)
  };

  var initWebRTC = function() {
    console.log("Initializing WebRTC");
    initDataChannel();

    // Callbacks I think I care about..
    connection.onnegotiationneeded = onNegotiationNeeded.bind(this);
    connection.onconnection = onConnectionEstablished.bind(this);
    connection.onicecandidate = onICECandidate.bind(this);
		connection.onsignalingstatechange = onSignalingStateChange;
		connection.oniceconnectionstatechange = onICEConnectionStateChange;
    connection.onicegatheringstatechange = onICEGatheringStateChange;

    onNegotiationNeeded();
  };

  // Should fire when P2P Connection is established.
  var onConnectionEstablished = function() {
    console.log("onConnectionEstablished: ");
  };

  var onCreateOfferFailure = function(e) {
    console.warn("failed to create offer");
  };

  var onCreateOfferSuccess = function(offer) {
    var onSetLocalDescriptionFailure = function() {
      console.warn("failed to set local description");
      console.log(offer);
    };

    var onSetLocalDescriptionSuccess = function() {
      console.info("onSetLocalDescriptionSuccess");
      wsSend(offer);
    };

    var desc = new RTCSessionDescription(offer);

    connection.setLocalDescription(
      desc,
      onSetLocalDescriptionSuccess,
      onSetLocalDescriptionFailure
    );
  };

  var onNegotiationNeeded = function() {
    console.log("onNegotiationNeeded");
    connection.createOffer(
      onCreateOfferSuccess,
      onCreateOfferFailure
    );
  };

  // A peer has accepted the connection.
  var onSessionAnswerReceived = function(msg) {
    console.log("onSessionAnswerReceived");
    var answer = new RTCSessionDescription({
      type: 'answer',
      sdp: msg.sdp
    });

    if (navigator.mozGetUserMedia) {
      connection.setRemoteDescription(answer, function(e) {
        console.log("setRemoteDesc success");
      }, function(e) {
        console.log("setRemoteDesc fail");
      });
    } else {
      connection.setRemoteDescription(answer);
        console.log("setRemoteDesc success");
    }
  };

  var begin = function() {
    initWebsock();
  };

  begin();
};

