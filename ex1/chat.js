window.addEventListener('DOMContentLoaded', (e) => {
  const peerId = Math.round(Math.random() * 0xFF).toString();
  const ws = new WebSocket('ws://localhost:4000/', 'chat');
  const $send = document.querySelector('#send');
  const $message = document.querySelector('#message');
  const $ul = document.querySelector('#messages');
  const $local = document.querySelector('#local');
  const $remote = document.querySelector('#remote');
  const $start = document.querySelector('#start');
  const $to = document.querySelector('#to');
  const $peerId = document.querySelector('#peerId');
  $peerId.textContent = peerId;

  const rtcPeerConnection = new RTCPeerConnection();
  rtcPeerConnection.onicecandidateerror = (e) => { console.log(e) };
  rtcPeerConnection.onicegatheringstatechange = (e) => { console.log(e) };
  rtcPeerConnection.onconnectionstatechange = (e) => { console.log(e) };

  rtcPeerConnection.addEventListener('signalingstatechange', (e) => {
    console.log('signaling', rtcPeerConnection.signalingState)
  });

  rtcPeerConnection.addEventListener('iceconnectionstatechange', (e) => {
    console.log(rtcPeerConnection.iceConnectionState);
    console.log(e)
  });

  rtcPeerConnection.addEventListener('track', (e) => {
    console.log(e);
  });

  rtcPeerConnection.addEventListener('addstream', (e) => {
    // 一回取り出す
    const stream = e.stream;
    console.log(stream);
    $remote.srcObject = stream;
    console.log(e);
  });

  ws.addEventListener('open', (e) => {
    console.log('client socket is open');
    $start.addEventListener('click', async () => {
      const to = $to.value;
      rtcPeerConnection.addEventListener('negotiationneeded', async (e) => {
        console.log('negotiationneeded');
        const offer = await rtcPeerConnection.createOffer();
        await rtcPeerConnection.setLocalDescription(offer);
        // offer を WebSocket で送りたい
        const message = JSON.stringify({
          from: peerId,
          to: to,
          data: offer
        });
        console.log(message);
        ws.send(message);
      });

      rtcPeerConnection.addEventListener('icecandidate', (e) => {
        if (e.candidate === null) { return; }
        console.log('icecandidate', e.candidate)
        ws.send(JSON.stringify({
          from: peerId,
          to: to,
          data: e.candidate
        }));
        console.log('candidate send');
      });

      const constraints = {
        video: {
          width: 100
        },
        audio: true
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        $local.srcObject = stream;
        const tracks = stream.getTracks();
        if (rtcPeerConnection.addTrack) {
          tracks.forEach((track) => {
            rtcPeerConnection.addTrack(track, stream);
          });
          console.log('addTrack');
        } else {
          rtcPeerConnection.addStream(stream);
          console.log('addStream');
        }
      } catch (err) {
        console.log(err);
      }
    });
    ws.addEventListener('message', async (e) => {
      const message = JSON.parse(e.data);
      $li = document.createElement('li');
      $li.textContent = e.data;
      $ul.appendChild($li);
      if (message['to'] !== peerId) {
        return
      }
      console.log(message);
      if (message.data['type'] === "offer") {
        console.log(message);
        await rtcPeerConnection.setRemoteDescription(message.data);
        console.log('set Offer To Remote');
        const answer = await rtcPeerConnection.createAnswer();
        console.log('createAnswer');
        await rtcPeerConnection.setLocalDescription(answer)
        console.log('setAnswerToLocal');
        const ansMessage = JSON.stringify({
          from: peerId,
          to: message.from,
          data: answer
        });
        console.log('ansMessage', ansMessage);
        ws.send(ansMessage);
      } else if (message.data['type'] === "answer") {
        await rtcPeerConnection.setRemoteDescription(message.data);
      } else {
        await rtcPeerConnection.addIceCandidate(message.data);
      }
    });
    // $send.addEventListener('click', (e) => {
    //   console.log($message.value);
    //   ws.send($message.value);
    // });
  });
});
