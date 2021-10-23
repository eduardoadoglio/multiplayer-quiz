const net = require('net');
const port = 7070;
const host = '127.0.0.1';
const server = net.createServer();


server.listen(port, host, () => {
  console.log(`TCP Server is running on port ${port}`);
});

let sockets = [];

function getIndexOfSocketInList(socketList, socket) {
  return sockets.findIndex(function(o) {
    return o.remoteAddress === socket.remoteAddress && o.remotePort === socket.remotePort
  });
};

function removeSocketFromList(socket) {
  let index = getIndexOfSocketInList(sockets, socket);
  if (index !== -1){
    sockets.splice(index, 1);
  }
};

server.on('connection', function(socket) {
  console.log(`-- Socket ${socket.remoteAddress}:${socket.remotePort} connected`);
  sockets.push(socket);
  socket.on('data', function(data){
    console.log(`-- Socket ${socket.remoteAddress}:${socket.remotePort} sent ${data}`);
    sockets.forEach(function(socket, index, array) {
      socket.write(`${data}`);
    });
  });

  socket.on('close', function(data) {
    removeSocketFromList(socket);
    socket.destroy();
    console.log(`-- Socket ${socket.remoteAddress}:${socket.remotePort} closed connection`);
  });

  socket.on('error', function(error) {
    removeSocketFromList(socket);
    socket.destroy();
  });

  socket.on('/', function(){
    console.log(`-------- Received / !!!`);
  });
});