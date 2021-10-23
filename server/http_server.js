const path = require('path');
const http = require('http');
const express = require('express');
const publicPath = path.join(__dirname, '../public');

let app = express();
let server = http.createServer(app);

// app.use(express.static(publicPath));

app.get('/client/client.js', function (req, res) {
    res.sendFile(path.join(__dirname, '../client/client.js'));
});

app.get('/', function (req, res) {
    res.sendFile(`${publicPath}/index.html`);
});

server.listen(3000, () => {
    console.log('Server started on port 3000');
});

