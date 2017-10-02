const myVideo = document.querySelector('#myVideo');
(async () => {
  const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false})
  myVideo.src = window.URL.createObjectURL(stream);
})()

