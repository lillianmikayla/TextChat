const http = require("http");
const fs = require("fs");
const url = require("url");

const host = '127.0.0.1';
const port = 8080;

const some_mime_types = {
    '.html': 'text/html',
    '.ico': 'image/png',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.zip': 'application/zip',
};

let messages = [];

const requestListener = (request, response) => {
    const parsedUrl = url.parse(request.url, true);
    let body = '';
    request.on('data', (chunk) => {
        body += chunk;
    });
    request.on('end', () => {
        console.log(`Got a request for ${request.url}, body=${body}`);
        let filename = parsedUrl.pathname.substring(1); // cut off the '/'

        if (filename.length === 0) {
            filename = 'client.html';
        }

        if (filename === 'ajax') {
            response.setHeader('Content-Type', 'application/json');
            if (request.method === 'POST') {
                const message = JSON.parse(body);
                messages.push(message);
                response.writeHead(200);
                response.end(JSON.stringify({ status: 'ok' }));
            } else if (request.method === 'GET') {
                response.writeHead(200);
                response.end(JSON.stringify(messages));
            }
            return;
        }

        fs.readFile(filename, (err, data) => {
            if (err) {
                response.writeHead(404);
                response.end(JSON.stringify(err));
                return;
            }
            const ext = filename.substring(filename.lastIndexOf('.'));
            response.setHeader('Content-Type', some_mime_types[ext] || 'text/plain');
            response.writeHead(200);
            response.end(data);
        });
    });
};

const server = http.createServer(requestListener);

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});