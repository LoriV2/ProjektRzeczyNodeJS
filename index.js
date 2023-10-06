const http = require('http');
const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static("strona"));
app.set('view engine', 'ejs');
// default URL for website
app.route('/')
  .all(function (req, res, next) {
    res.render(path.join(__dirname + '/podstrony/index.ejs'), { data: "jej" });
  });
app.route('/Nartykuly')
  .all(function (req, res, next) {
    res.render(path.join(__dirname + '/podstrony/Narykuly.ejs'));
  });



app.route('/skrypty/skrypt.js')
  .all(function (req, res, next) {
    res.sendFile(path.join(__dirname + '/skrypty/skrypt.js'));
  });

app.route('/css/css.css')
  .all(function (req, res, next) {
    res.sendFile(path.join(__dirname + '/css/css.css'));
  });
