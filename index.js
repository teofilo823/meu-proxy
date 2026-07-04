const http = require('http');
const net = require('net');
const url = require('url');

console.log("🚀 Proxy iniciando no Render...");

const proxy = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('✅ Proxy está online! Use CONNECT para HTTPS.');
});

// === SUPORTE A HTTPS (CONNECT) ===
proxy.on('connect', (req, clientSocket, head) => {
    const { hostname, port } = url.parse(`http://${req.url}`);

    if (!hostname) {
        clientSocket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
        return;
    }

    const targetPort = port || 443;

    console.log(`🔗 Conectando ${hostname}:${targetPort}`);

    const serverSocket = net.connect(targetPort, hostname, () => {
        clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        serverSocket.write(head);
        serverSocket.pipe(clientSocket);
        clientSocket.pipe(serverSocket);
    });

    serverSocket.on('error', (err) => {
        console.error(`❌ Erro no target ${hostname}:`, err.message);
        clientSocket.end('HTTP/1.1 502 Bad Gateway\r\n\r\n');
    });

    clientSocket.on('error', (err) => {
        console.error('❌ Erro no client:', err.message);
        serverSocket.destroy();
    });
});

const PORT = process.env.PORT || 8080;

proxy.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Proxy rodando na porta ${PORT}`);
    console.log(`🔗 URL: http://seu-app.onrender.com`);
});
