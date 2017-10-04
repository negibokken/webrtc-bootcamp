const dgram = require('dgram');
const message = Buffer.from([0x00, 0x01, 0x00, 0x00, 0x21, 0x12, 0xa4, 0x42,
0xb8, 0xbb, 0xd8, 0x49, 0x3d, 0x90, 0x97, 0x4a,
0xc1, 0x07, 0xdb, 0xa9])
const client = dgram.createSocket('udp4');
// 19302 stun.l.google.com
client.send(message, 19302, 'stun.l.google.com', (err) => {
    // client.close();
});

client.on('message', (msg, rinfo) => {
  console.log('msg', msg);
  console.log('rinfo', rinfo);
})