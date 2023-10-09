require('dotenv').config();
const express = require('express');
const app = express();
var sql = require('mssql');
const fs = require('fs');

// Wczytaj dane z pliku .json
const rawData = fs.readFileSync('rzeczy.json', 'utf8');
var dbconfig = JSON.parse(rawData);

const pool = new sql.ConnectionPool(dbconfig);
pool.connect()
  .then((pool) => {
    console.log('Połączono z bazą danych.');
  })
  .catch((err) => {
    console.error('Błąd połączenia z bazą danych:', err);
  });

app.use(express.json());
app.use(express.static('views'));
app.set('view engine', 'pug');

const PORT = process.env.PORT || 3030;

app.route('/')
  .all(function (req, res, next) {
    let query = "Select TOP 4 * From artykuly ORDER BY data_dodania";
    res.render('index', { title: 'Strona Główna', message: 'Hello there!' });
  }

  )
  .post(function (req, res, next) {
    let query = "Select TOP 4 * From artykuly ORDER BY data_dodania";

  })

  ;
app.route('/Nartykuly')
  .all(function (req, res, next) {
    res.render('Narykuly', { title: 'Najnowsze artykuły', message: 'Hello there!' });
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


