const net = require('net');
const port = 7070;
const host = '127.0.0.1';
const server = net.createServer();


server.listen(port, host, () => {
  console.log(`TCP Server is running on port ${port}`);
});

let sockets = [];

server.on('connection', function(socket) {
  console.log(`-- Socket ${socket.remoteAddress}:${socket.remotePort} connected`);
  sockets.push(socket);
  socket.on('data', function(data){
    console.log(`-- Socket ${socket.remoteAddress}:${socket.remotePort} sent ${data}`);
    sockets.forEach(function(socket, index, array) {
      socket.write(`-- Socket ${socket.remoteAddress}:${socket.remotePort} said ${data}\n`);
    });
  });

  socket.on('close', function(data) {
    let index = sockets.findIndex(function(o) {
      return o.remoteAddress === socket.remoteAddress && o.remotePort === socket.remotePort
    });
    if (index !== -1){
      sockets.splice(index, 1);
    }
    console.log(`-- Socket ${socket.remoteAddress}:${socket.remotePort} closed connection`);
  });
});