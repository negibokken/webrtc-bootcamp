window.addEventListener('DOMContentLoaded', (e) => {
  const ws = new WebSocket('ws://localhost:4000/', 'echo-protocol');
  const $send = document.querySelector('#send');
  const $message = document.querySelector('#message');
  const $ul = document.querySelector('#messages');
  const $local = document.querySelector('#local');
  ws.addEventListener('open', (e) => {
    console.log('client socket is open');
    ws.addEventListener('message', (e) => {
      $li = document.createElement('li');
      $li.textContent = e.data;
      $ul.appendChild($li);
    });
    $send.addEventListener('click', (e) => {
      console.log($message.value);
      ws.send($message.value);
    });
  });
  // Camera
  const constraints = {
    video: {
      // width: {min: 640, ideal: 1280, max: 1920},
      width: 1920
    },
    audio: true
  }

  navigator.mediaDevices.addEventListener('devicechange', (e) => {
    // console.log(e);
    navigator.mediaDevices.enumerateDevices()
    .then((mediaDeviceInfos) => {
      mediaDeviceInfos.forEach((mediaDeviceInfo) => {
        console.log(mediaDeviceInfo.kind, mediaDeviceInfo.label);
      });
    })
    .catch((err) => {
      console.error(err);
    });
  });


  const supported = navigator.mediaDevices.getSupportedConstraints();
  if(supported["facingMode"]) {
    constraints["facingMode"] = "environment";
  }
  console.log(supported);
  navigator.mediaDevices.getUserMedia(constraints)
  .then((stream) => {
    $local.srcObject = stream;
    // $local.play();
  }).catch((err) => {
    console.log(err);
  });
});
