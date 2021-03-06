window.addEventListener('DOMContentLoaded', (e) => {
  // const peerId = btoa(Math.random());
  const peerId = Math.round(Math.random() * 0xFF).toString();
  const $peerId = document.querySelector('#peerId');
  const $to = document.querySelector('#to');
  $peerId.textContent = peerId;
  const $start = document.querySelector('#start');

  const rtcPeerConnection = new RTCPeerConnection();
  console.log('rtcPeerConnection', rtcPeerConnection);

  const ws = new WebSocket('ws://localhost:4000', 'chat');

  ws.onerror = (e) => console.log(e);
  ws.onclose = (e) => console.log(e);

  ws.addEventListener('open', (e) => {
    console.log('open');

    // RTCPeerConnection handler
    rtcPeerConnection.addEventListener('datachannel', (e) => {
      console.log('--- お昼のゴール ---', e);
    });

    rtcPeerConnection.addEventListener('negotiationneeded', async (e) => {
      console.log(e.type);
      const offer = await rtcPeerConnection.createOffer();
      await rtcPeerConnection.setLocalDescription(offer);
      const message = JSON.stringify({
        from: peerId,
        to: $to.value,
        data: offer
      });
      console.log(message);
      ws.send(message);
    });

    rtcPeerConnection.addEventListener('icecandidate', (e) => {
      console.log(e);
    });

    rtcPeerConnection.addEventListener('signalingstatechange', (e) => {
      console.log('singaling:');
      console.log(e.type, rtcPeerConnection.signalingState);
    });
    rtcPeerConnection.addEventListener('iceconnectionstatechange', (e) => {
      console.log(e.type, rtcPeerConnection.iceConnectionState);
    });
    rtcPeerConnection.addEventListener('icegatheringstatechange', (e) => {
      console.log(e.type, rtcPeerConnection.iceGatheringState);
    });
    rtcPeerConnection.addEventListener('connectionstatechange', (e) => {
      console.log(e.type, rtcPeerConnection.connectionState);
    });

    rtcPeerConnection.addEventListener('icecandidateerror', (e) => {
      console.error(e);
    });
    $start.addEventListener('click', (e) => {
      const to = $to.value

            // DataChannel
      const label = 'chat';
      const rtcDataChannel = rtcPeerConnection.createDataChannel(label);

      console.log(rtcDataChannel);

      // DataChannel handler
      rtcDataChannel.addEventListener('open', (e) => {
        console.log('---rtcdatachannel---');
        console.log(e);
      });
      rtcDataChannel.addEventListener('bufferedamountlow', (e) => {
        console.log('---rtcdatachannel---');
        console.log(e);
      });
      rtcDataChannel.addEventListener('message', (e) => {
        console.log('---rtcdatachannel---');
        console.log(e);
      });

      // あんまり触らない部分
      rtcDataChannel.addEventListener('close', (e) => {
        console.log('---rtcdatachannel---');
        console.log(e.type);
      });
      rtcDataChannel.addEventListener('error', (e) => {
        console.log('---rtcdatachannel---');
        console.error(e);
      });
    });
  });

  ws.addEventListener('message', async (e) => {
    const message = JSON.parse(e.data);
    // 自分宛てのものでなければ処理しない
    if (message['to'] !== peerId) {
      return
    }
    console.log('message comming', message.data);
    if (message.data['type'] === "offer") {
      console.log('message.data', message.data);
      await rtcPeerConnection.setRemoteDescription(message.data);
      console.log('set offer');
      const answer = await rtcPeerConnection.createAnswer();
      console.log('create answer');
      console.log(answer);
      await rtcPeerConnection.setLocalDescription(answer);
      console.log('set answer');

      const answerMessage = JSON.stringify({
        from: peerId,
        to: $to.value,
        data: answer
      });
      console.log('answer message', answerMessage);
      ws.send(answerMessage);
      console.log('send answer message');
    } else if (message.data['type'] === 'answer') {
      console.log('answer:', message.data);
      await rtcPeerConnection.setRemoteDescription(message.data);
      console.log('set answer');
    } else {
      // candidate が送らてくるとき
      await rtcPeerConnection.addIceCandidate(message.data);
      // console.log('addIceCandidate');
    }
  });
});

