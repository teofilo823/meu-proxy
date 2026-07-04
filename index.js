const http = require('http');
const net = require('net');
const url = require('url');

console.log("🚀 Proxy iniciando...");

const proxy = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Proxy Render está online!');
});

proxy.on('connect', (req, clientSocket, head) => {
  const { hostname, port } = url.parse(`http://${req.url}`);
  const serverSocket = net.connect(port || 443, hostname, () => {
    clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    serverSocket.write(head);
    serverSocket.pipe(clientSocket);
    clientSocket.pipe(serverSocket);
  });
});

const PORT = process.env.PORT || 8080;
proxy.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Proxy rodando em http://0.0.0.0:${PORT}`);
});
