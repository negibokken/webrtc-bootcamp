'use strict';

// client
const client = new WebSocket('ws://localhost:4000/', 'chat');
// handler

client.addEventListener('error', () => {
  console.log('Connection Error');
});
client.addEventListener('open', () => {
  console.log('WebSocket Client Connected');
});
client.addEventListener('close', () => {
  console.log('echo-protocol Client Closed');
});

// UI controllers
// client id
const id = Math.round(Math.random() * 0xFF);
const $send = document.querySelector('#send');
const $ul = document.querySelector('#chatArea');
$send.addEventListener('click', () => {
  const $message = document.querySelector('#message');
  client.send(`${$message.value} (ID:${id})`);
  $message.value = ""
});

client.addEventListener('message', (e) => {
  if (typeof e.data === 'string') {
    const $li = document.createElement('li');
    $li.textContent = e.data;
    $ul.appendChild($li);
  }
});

