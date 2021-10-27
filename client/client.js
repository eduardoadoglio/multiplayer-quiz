export const name = 'tcpClient';

import net from "net";

export class TCPClient {alg
    constructor(port, host) {
        this.port = port;
        this.host = host;
        this.client = new net.Socket();
    }

    write(data) {
        client.connect(port, host, function(){
            client.write(`${data}\n`);
        })
    }
}

const client = new net.Socket();
const port = 7070;
const host = '127.0.0.1';

client.connect(port, host, function(){
    console.log('-- Connected to server');
    client.write(`Hello from Client ${client.address().address}`);
})

client.on('data', function(data){
    console.log(`-- Received ${data} from server`);
});

client.on('close', function(){
    console.log('-- Connection closed');
});