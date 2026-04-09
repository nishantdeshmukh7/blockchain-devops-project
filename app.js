const http = require('http');

const server = http.createServer((req, res) => {
  res.write('Hello from DevOps Blockchain Project 🚀');
  res.end();
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});