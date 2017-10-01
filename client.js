'use strict';
const W3CWebSocket = require('websocket').w3cwebsocket;

// client
const client = new W3CWebSocket('ws://localhost:4000/', 'echo-protocol');
// handler
client.onerror = function() {
  console.log('Connection Error');
};
client.onopen = function() {
  console.log('WebSocket Client Connected');
};
client.onclose = function() {
  console.log('echo-protocol Client Closed');
};

// UI controllers
// client id
const id = Math.round(Math.random() * 0xFF);
const $send = document.getElementById('send');
const $ul = document.getElementById('chatArea');
$send.addEventListener('click', () => {
  const $message = document.getElementById('message');
  client.send(`${$message.value} (ID:${id})`);
  $message.value = ""
});

client.onmessage = function(e) {
  if (typeof e.data === 'string') {
    const $li = document.createElement('li');
    $li.innerHTML = e.data;
    $ul.appendChild($li);
  }
};


