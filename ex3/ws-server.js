const http = require('http');
const crypto = require('crypto');
const assert = require('assert');

const server = http.createServer((req, res) => {
    console.log(req.url);
    console.log(req.headers);
    res.setHeader('Content-Type', 'text/html');
    res.write('hello');
    res.end();
});

server.listen(4000);

function createAcceptValue(key) {
    const salt = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
    const con = key+salt;
    const accept = crypto.createHash("sha1")
        .update(con)
        .digest("base64");
    return accept;
}

server.on('upgrade', (req, socket, head) => {
    console.log(req.headers);
    const key = req.headers['sec-websocket-key'];
    const accept = createAcceptValue(key);
    console.log(accept);

    const  res = `HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: ${accept}
Sec-WebSocket-Protocol: chat

`

    socket.write(res);

    socket.on('data', (data) => {
        console.log(data);
        const first = data.readUInt8(0);
        console.log(first);
        const fin = (first  & 128 >> 7) === 1;
        const rsv1 = (first & 64) >> 6
        const rsv2 = (first & 32) >> 5
        const rsv3 = (first & 16) >> 4
        const opcode = first & 15

        console.log('fin', fin);
        console.log('rsv1', rsv1);
        console.log('rsv2', rsv2);
        console.log('rsv3', rsv3);
        console.log('opcode', opcode);

        let op = ""
        switch (opcode) {
            // %x0 denotes a continuation frame
            case 0x0:
               op = "continuation";
               break;
            // %x1 denotes a text frame
            case 0x1:
                op = "text";
                break;
            // %x2 denotes a binary frame
            case 0x2:
                op = "binary";
                break;
            // %x8 denotes a connection close
            case 0x8:
                op = "connection closed";
                break;
            // %x9 denotes a ping
            case 0x9:
                op = "ping";
                break;
            // %xA denotes a pong
            case 0xa:
                op = "pong";
                break;
            // %x3-7 are reserved for further non-control frames
            // %xB-F are reserved for further control frames
            default:
                op = "reserved";
        }
        console.log(op);

        const second = data.readUInt8(1);
        const mask = ((second & 128) >> 7) === 1;
        const payloadLen = second & 127;
        console.log('second', second);
        console.log('mask', mask);
        console.log('payloadLen', payloadLen);
        if (payloadLen <= 125)  {
            // nop
        } else if (payloadLen === 126) {
            // 2 bytes
            payloadLen = data.readUInt16BE(2);
        } else if (payloadLen === 127) {
            // ignore
        }

        let maskingKey;
        if (mask) {
            maskingKey = data.slice(2, 2+4);
        }
        console.log('maskingKey', maskingKey);

        const maskedPayload = data.slice(6,6 + payloadLen)
        console.log('payload', maskedPayload);

        const payload = Buffer.alloc(payloadLen);
        for (let i = 0; i < payloadLen; i++) {
            payload[i] = maskedPayload.readUInt8(i) ^ maskingKey.readUInt8(i % 4)
        }

        console.log('payload', payload.toString());

        const res = createResponse(payload);
        socket.write(res);
    });

});

function createResponse(payload) {
    const fin = 1; // true
    const rsv1 = 0;
    const rsv2 = 0;
    const rsv3 = 0;
    const opcode = 0x01;
    const mask = 0; // false
    const length = payload.length;
    const first = (fin << 7)
        + (rsv1 << 6)
        + (rsv2 << 5)
        + (rsv3 << 4)
        + (opcode)
    const second = (mask << 7)
        + payload.length;
    console.log('first', first);
    console.log('second', second);
    console.log('length', length);
    const res = Buffer.alloc(2 + payload.length);
    res.writeUInt8(first,0);
    res.writeUInt8(second,1);
    for (i=0; i<payload.length; i++) {
        res.writeUInt8(payload.readUInt8(i), 2+i)
    }
    return res;
}

// for test
// function test() {
//     const key = "dGhlIHNhbXBsZSBub25jZQ==";
//     const expected = "s3pPLMBiTxaQ9kYGzzhZRbK+xOo=";
//     const actual = createAcceptValue(key);
//     assert.equal(actual, expected);
//     console.log(actual === expected);
// }
// test();