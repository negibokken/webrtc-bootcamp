#!/usr/bin/env node
'use strict';
const WebSocketClient = require('websocket').client;
const readlineSync = require('readline-sync');

const client = new WebSocketClient();

const number = Math.round(Math.random() * 0xFFFFFF);

client.on('connectFailed', function(error) {
  console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
  console.log('WebSocket Client Connected');
  connection.on('error', function(error) {
    console.log('Connection Error: ' + error.toString());
  });
  connection.on('close', function() {
    console.log('echo-protocol Connection Closed');
  });
  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      console.log("Received: '" + message.utf8Data + "'");
    }
  });

  function sendMessage() {
    if (connection.connected) {
      const message = readlineSync.question('message: ');
      connection.sendUTF(`Client: ${number.toString()}: ${message}`);
      setTimeout(sendMessage, 100);
    }
  }
  sendMessage();
});

client.connect('ws://localhost:8080/', 'echo-protocol');
