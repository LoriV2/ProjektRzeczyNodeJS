require('dotenv').config();
const express = require('express');
const app = express();
//serwer połączenie
var sql = require('mssql');
//pliki!!
const fs = require('fs');
// Wczytaj dane z pliku .json
const rawData = fs.readFileSync('rzeczy.json', 'utf8');
var dbconfig = JSON.parse(rawData);
//do szyfrowania
const crypto = require('crypto');
const secretKey = crypto.randomBytes(32).toString('hex');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({ secret: secretKey, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());


async function connectDatabase(querry) {
  try {
    await sql.connect(dbconfig);
    console.log('Połączono z bazą danych');

    // Wykonaj zapytanie
    const result = await sql.query(querry);
    return result.recordset;
  } catch (error) {
    console.error('Błąd połączenia z bazą danych:', error);
  } finally {
    // Zamknij połączenie po użyciu
    sql.close();
  }
}

// Wywołaj funkcję łączenia z bazą danych

// Skonfiguruj Passport i zdefiniuj strategię lokalną
passport.use(new LocalStrategy(
  (username, password, done) => {
    connectDatabase('SELECT * FROM uzytkownicy WHERE Haslo_uz = ' + password + ' && Login_uz = ' + username + ' ');
    // Sprawdź, czy użytkownik o podanym loginie i haśle istnieje w bazie danych
    // Jeśli uwierzytelnienie jest pomyślne, wywołaj done(null, user);
    // W przeciwnym razie, wywołaj done(null, false);
  }
));

// Serializuj i deserializuj użytkownika
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  // Pobierz użytkownika na podstawie ID
  // Jeśli użytkownik istnieje, wywołaj done(null, user);
  // W przeciwnym razie, wywołaj done(null, null);
});



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
    res.render('index', { title: 'Strona Główna', message: connectDatabase("SELECT * FROM uzytkownicy") });
  }

  )
  .post(function (req, res, next) {
    let query = "Select TOP 4 * From artykuly ORDER BY data_dodania";

  });
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

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


