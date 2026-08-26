const dgram = require('dgram'); 
const sock = dgram.createSocket('udp4'); 
sock.on('error', console.error);
sock.on('message', m => console.log('RCV:', m.toString())); 
sock.bind(15061, () => { 
  const msg = 'REGISTER sip:103.137.84.11 SIP/2.0\r\nVia: SIP/2.0/UDP 192.168.2.111:15061;rport;branch=z9hG4bKtest\r\nFrom: <sip:399867@103.137.84.11>;tag=123\r\nTo: <sip:399867@103.137.84.11>\r\nCall-ID: testreg\r\nCSeq: 1 REGISTER\r\nContact: <sip:399867@192.168.2.111:15061>\r\nExpires: 3600\r\nMax-Forwards: 70\r\nContent-Length: 0\r\n\r\n'; 
  sock.send(msg, 5060, '103.137.84.11'); 
  console.log('Sent REGISTER'); 
  setTimeout(()=>sock.close(), 5000); 
});
