const http = require('http');
const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static('views'));
app.set('view engine', 'pug');

const PORT = process.env.PORT || 3030;

app.route('/')
  .all(function (req, res, next) {
    res.render('index', { title: 'Strona Główna', message: 'Hello there!' });
  });
app.route('/Nartykuly')
  .all(function (req, res, next) {
    res.render('Narykuly', { title: 'Hey', message: 'Hello there!' });
  });


app.use((req, res, next) => {
  res.status(404).send("Nie ma czegoś takiego!")
});

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Coś sie popsuło!!!')
});

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});


