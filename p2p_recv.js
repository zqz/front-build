var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;

// I don't think is needed since I'm only going to use a DataChannel

var P2PReceiver = function(connection, sessionID, callbacks) {
  var api_path = "/api/v1/p2p/" + sessionID;
  var desc = null;

  var initWebRTC = function() {
    console.log("Initializing WebRTC");

    connection.ondatachannel = onDataChannel.bind(this);
    connection.onconnection = onConnectionEstablished.bind(this);
    connection.onicecandidate = onConnectionICECandidate.bind(this);
		connection.onsignalingstatechange = onSignalingStateChange;
		connection.oniceconnectionstatechange = onICEConnectionStateChange;
		connection.onicegatheringstatechange = onICEGatheringStateChange;
  };

  var onDataChannelMessage = function(evt) {
    console.log("onDataChannelMessage");
    console.log(evt)
  };

  var onDataChannelOpen = function(e) {
    console.log("onDataChannelOpen");
    console.log(e)
    callbacks.connect();
  };

  var onDataChannelClose = function(e) {
    console.log("onDataChannelClose");
    console.log(e)
    callbacks.disconnect();
  };

  var onDataChannelError = function(e) {
    console.log("onDataChannelError");
    console.log(e)
  };

  var onDataChannel = function(evt) {
    var channel = evt.channel || evt;

    channel.onmessage = onDataChannelMessage.bind(this);
    channel.onopen = onDataChannelOpen.bind(this);
    channel.onclose = onDataChannelClose.bind(this);
    channel.onerror = onDataChannelError.bind(this);

    console.log("onDataChannel");
    console.log(evt);
  };

  var rtcSendAnswer = function(answer) {
    var data = JSON.stringify(answer);

    var req = new XMLHttpRequest();
    req.open("POST", api_path);
    req.setRequestHeader("Content-type", "application/json");
    req.addEventListener('readystatechange', onSendAnswerStateChange.bind(this, req));
    req.send(data);
  };

  var onSendAnswerSuccess = function() {
    console.log("onSendAnswerSuccess");
  };

  var onSendAnswerFailure = function() {
    console.log("onSendAnswerFailure");
  };

  var onSendAnswerStateChange = function(xhr, evt) {
    if (xhr.readyState === 4) {
      if(xhr.status === 200) {
        onSendAnswerSuccess();
      } else {
        onSendAnswerFailure();
      }
    }
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

  // Should fire when P2P Connection is established.
  var onConnectionEstablished = function() {
    console.log("onConnectionEstablished: ");
  };

  // Not 100% certain.
  var onConnectionICECandidate = function(evt) {
    console.log("onConnectionICECandidate: ")
    console.log(evt);
    var candidate = evt.candidate;

    if ( candidate === null) {
      rtcSendAnswer(connection.localDescription);
    }
  };

  var onCreateAnswerSuccess = function(answer) {
    console.log("onCreateAnswerSuccess");
    connection.setLocalDescription(answer);
    // rtcSendAnswer(answer);
  };

  var onCreateAnswerFailure = function(evt) {
    console.log("onCreateAnswerFailure");
    console.log(evt);
  };


  // Offer with Session ID exists.
  var onGetOfferSuccess = function(msg) {
    console.log("onGetOfferSuccess: ")
    console.log(msg)

    desc = new RTCSessionDescription({
      type: 'offer',
      sdp: msg.sdp
    });

    callbacks.sessionExists();
  };

  this.createAnswer = function() {
    if (navigator.mozGetUserMedia) {
      connection.setRemoteDescription(desc).then(function() {
        connection.createAnswer(
          onCreateAnswerSuccess,
          onCreateAnswerFailure
        );
      });
    } else {
      connection.setRemoteDescription(desc);
      connection.createAnswer(
        onCreateAnswerSuccess,
        onCreateAnswerFailure
      );
    }
  };

  // No offer with specified session id exists.
  var onGetOfferFailure = function(msg) {
    console.log("onGetOfferFailure: ")

    callbacks.sessionNotFound();
  };

  var onGetOfferStateChange = function(xhr, evt) {
    if (xhr.readyState === 4) {
      if(xhr.status === 200) {
        var msg = JSON.parse(xhr.response);
        onGetOfferSuccess(msg);
      } else {
        onGetOfferFailure(evt);
      }
    }
  };

  // look up a session's offer.
  var getOffer = function() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", api_path);
    xhr.addEventListener('readystatechange', onGetOfferStateChange.bind(this, xhr));
    xhr.send();
  };

  initWebRTC();
  getOffer();
};
