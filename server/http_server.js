const path = require('path');
const http = require('http');
const express = require('express');
const net = require('net');
const publicPath = path.join(__dirname, '../public');
const client = new net.Socket();

require('dotenv').config();

const tcpPort = process.env.TCP_PORT;
const tcpIP = process.env.TCP_IP;

let app = express();
let server = http.createServer(app);


client.connect(tcpPort, tcpIP);

client.on('data', function(data) {
	data = JSON.parse(data);
    switch(data.route) {
        case '/player/':
            console.log("Player novo nesta pourra");
            break;
    }
});

client.on('close', function() {
	console.log('Connection closed');
});

function getRouteNameFromRequest(request) {
    fullPath = request.originalUrl;
    pathSplit = fullPath.split("?");
    routeName = pathSplit[0];
    return routeName;
};

app.use(function(req, res, next) {
    routeName = getRouteNameFromRequest(req)
    client.write(JSON.stringify({route: routeName}));
    next();
});

app.use(express.static(publicPath));

server.listen(3000, () => {
    console.log('Server started on port 3000');
});

