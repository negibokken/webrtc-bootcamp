window.addEventListener("DOMContentLoaded", (e) => {
  const ws = new WebSocket('ws://localhost:4000', 'chat');
  const $send = document.querySelector('#send');
  const $message = document.querySelector('#message');
  const $messages = document.querySelector('#messages');

  ws.addEventListener('open', (e) => {
    console.log(e);
    // $send.onclick は古い
    $send.addEventListener('click', (e) => { // eventListnerなら複数呼べる
      ws.send($message.value);
    });

    ws.addEventListener('message', (e) => {
      console.log(e);
      const $li = document.createElement('li');
      // $li.innerHTML = e.data; innerHTMLはXSSされる原因になったりする
      $li.textContent = e.data;
      $messages.appendChild($li);
    });
  });
});