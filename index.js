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
//do logowania
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({ secret: secretKey, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.static('views'));
app.set('view engine', 'pug');

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
    let czyjest = connectDatabase('SELECT * FROM uzytkownicy WHERE Haslo_uz = ' + password + ' && Login_uz = ' + username + ' ');
    if(czyjest[0] != ""){
      done(null, false);
    }else{
      let user = czyjest[0];
      done(null, user);
    }
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


const PORT = process.env.PORT || 3030;
//wszystkie drogi prowadzą do mojej strony
  app.route('/')
    .all(function (req, res, next) {
      let query = "Select TOP 4 * From artykuly ORDER BY data_dodania";
      res.render('index', { title: 'Strona Główna', message: connectDatabase("SELECT * FROM uzytkownicy") });
    });
    
  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  app.route('/Login')
    .all(function (req, res, next) {
      res.render('login', { title: 'Logowanie' });
    
    })
    .post( passport.authenticate('local', { failureRedirect: '/Login' }), function (req, res, next){
      res.render('index', { title: 'Strona Główna'})
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


