import { createServer, IncomingMessage, ServerResponse } from 'http';
const port = 1339;
createServer(async function (request, response) {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('Hello World <yourname>');
}).listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
//# sourceMappingURL=server.js.map