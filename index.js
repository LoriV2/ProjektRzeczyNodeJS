const http = require('http');
const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static("express"));
// default URL for website
app.route('/')
  .all(function (req, res, next) {
    res.sendFile(path.join(__dirname + '/podstrony/index.html'));
  });
const hostname = 'localhost';
const port = 3000;

const server = http.createServer((app));

app.route('/skrypty/skrypt.js')
  .all(function (req, res, next) {
    res.sendFile(path.join(__dirname + '/skrypty/skrypt.js'));
  });

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});