//index.js stworzony przez: Lorenzo Marinucci
// Wczytaj dane z pliku .json
const tajnyklucz = require("./rzeczy.json");
//powiadomienia dla serwera
const flash = require('connect-flash');
//passport.js do sesji i logiki logowania
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
//express.js
const session = require('express-session');
const express = require('express');
const app = express();
//biblioteka do wczytywania danych z formularzy
const bodyParser = require('body-parser');
//do szyfrowania
const crypto = require('crypto');
//funkcja do zadawania pytań bazie danych
const Pytanie = require('./DatabaseHandl.js');
//ikonka
const favicon = require('serve-favicon');

//serwer połączenie
var admin = require("firebase-admin");
const { resolve } = require('path');
const FirebaseStore = require('connect-session-firebase')(session);
//zmienne potrzebne do dalszego działania serwera
let sformatowane;
let opcje = { year: 'numeric', month: 'long', day: 'numeric' };
let artid;

//połączenie z bazą danych
admin.initializeApp({
  credential: admin.credential.cert(tajnyklucz),
  databaseURL: "https://data-y6-default-rtdb.europe-west1.firebasedatabase.app"
});;
const baza = admin.database();

//zapisywanie danych użytkownika w sesji
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username, rola: user.rola });
  });
});

//usuwanie danych użytkownika w sesji
passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

//logika do logowania
passport.use(new LocalStrategy(
  (username, password, done) => {
    baza.ref('uzytkownicy').orderByChild('login').equalTo(username).once('value', (cos) => {
      if (cos.exists()) {
        if ((crypto.createHash('sha256').update(password).digest('hex')) === (cos.val()[Object.keys(cos.val())[0]].haslo)) {
          return done(null, { id: Object.keys(cos.val())[0], username: cos.val()[Object.keys(cos.val())[0]].login, rola: cos.val()[Object.keys(cos.val())[0]].rola });
        } else {
          return done(null, false, { message: 'Nieprawidłowe hasło' });
        }
      } else {
        return done(null, false, { message: 'Nieprawidłowy login' });
      }
    })
  }
));

//deklarowanie z czego będzie korzystać serwer
app.use(session({
  store: new FirebaseStore({
    database: admin.database()
  }),
  resave: false,
  secret: crypto.randomBytes(32).toString('hex'), // Sekretny klucz dla sesji
  saveUninitialized: false,
  cookie: { secure: false }
}));
app.use(passport.initialize());//sesja
app.use(passport.session());//sesja
app.use(passport.authenticate('session'));//sesja
app.use(bodyParser.urlencoded({ extended: true }));//formularze
app.use(express.json());//formularze
app.use(express.static('views'));//podstrony i pliki w folderze views
app.use(favicon('./views/zdjecie/fav.ico'));
app.set('view engine', 'pug');//używam pug.js do renderowania stron
app.use(flash());//powiadomienia serwerowe

//wszystkie drogi prowadzą do mojej strony

//strona główna
app.route('/')
  .all(function (req, res, next) {
    Pytanie(baza, 1, "aaa")
      .then((odpowiedz) => {
        res.render('index', {
          title: 'Strona Główna', message: odpowiedz, dane_uz: req.session.passport && req.session.passport.user ? req.session.passport.user : ''
        });
      })
      .catch((error) => {
        res.render('index', { title: 'Strona Główna', message: "" });
        console.error("Błąd:", error);
      });
  });

//podstrona O nas
app.route('/Onas')
  .all(function (req, res, next) {
    res.render('Onas', {
      title: 'O nas', dane_uz: req.session.passport && req.session.passport.user ? req.session.passport.user : ''
    })
  });

//Pokazuje wszystkie artykuły
app.route('/Nartykuly')
  .all(function (req, res, next) {
    Pytanie(baza, 6, "")
      .then((odpowiedz) => {
        res.render('wszystkiekury', { title: 'Najnowsze artykuły', message: odpowiedz, dane_uz: req.session.passport && req.session.passport.user ? req.session.passport.user : '' });
      }).catch((error) => {
        res.render('index', {
          title: 'Strona Główna', message: "", dane_uz: req.session.passport && req.session.passport.user ? req.session.passport.user : ''
        });
        console.error("Błąd:", error);
      });

  });

//droga do pojedyńczych artykułów
app.get('/artykul', (req, res) => {
  if ((req.query.nr != undefined) || (req.query.slonce != undefined) || (req.query.chmurka != undefined)) {
    artid = req.query.nr || req.query.slonce || req.query.chmurka;
    Pytanie(baza, 4, artid)
      .then((odpowiedz) => {
        odpowiedz.data_dodania_art = new Date(odpowiedz.data_dodania_art);
        sformatowane = odpowiedz.data_dodania_art.toLocaleDateString(undefined, opcje);
        dane_do_wyslania =
        {
          tagi: odpowiedz.tagi,
          liczba:
          {
            slonce: odpowiedz.slonca,
            chmurka: odpowiedz.chmurki
          },
          data: sformatowane,
          title: odpowiedz.tytul_art,
          message: odpowiedz,
          gdzie: artid,
          dane_uz: req.session.passport && req.session.passport.user ? req.session.passport.user : '',
          doprzycisku: req.query.nr,
          komentarze: odpowiedz.komentarze
        }
        res.render('artykul', dane_do_wyslania);
      })
      .catch((error) => {
        res.redirect('/');
        console.error("Błąd:", error);
      });
  } else {
    res.render('artykul', { title: 'Artykuł', message: 'Taki artykuł nie istnieje!', dane_uz: req.session.passport && req.session.passport.user ? req.session.passport.user : '' });
  }

});

//panel administratora
app.route('/admin')
  .post(function (req, res, next) {
    if ((req.isAuthenticated()) && (req.session.passport.user.rola == 'administrator')) {
      Pytanie(baza, 9, { id: req.session.passport.user.id, tresc: req.body.tresc, tytul: req.body.tytul, zdjc: req.body.zdjc, tagi: req.body.tagi }).then(
        res.redirect('/admin'));
    } else {
      res.redirect('/Login');
    }
  })
  .all(function (req, res, next) {
    if ((req.isAuthenticated()) && (req.session.passport.user.rola == 'administrator')) {
      Pytanie(baza, 8).then((cos) => {
        res.render('admin', { cos, dane_uz: req.session.passport && req.session.passport.user ? req.session.passport.user : '' });
      }
      );
    } else {
      res.redirect('/Login');
    }
  });

//strona z formularzem nowy artykuł
app.route('/nowy')
  .post(function (req, res, next) {
    if ((req.isAuthenticated()) && ((req.session.passport.user.rola == "pracownik") || (req.session.passport.user.rola == "administrator"))) {
      Pytanie(baza, 3, { id: req.session.passport.user.id, tresc: req.body.tresc, tytul: req.body.tytul, zdjc: req.body.zdjc, tagi: req.body.tagi }).then(
        res.redirect('/nowy'));
    } else {
      res.redirect('/Login');
    }
  })
  .all(function (req, res, next) {
    if ((req.isAuthenticated()) && ((req.session.passport.user.rola == "pracownik") || (req.session.passport.user.rola == "administrator"))) {
      res.render('nowyrykul', { title: 'Nowy artykuł', dane_uz: req.session.passport && req.session.passport.user ? req.session.passport.user : '' });
    } else {
      res.redirect('/Login');
    }
  });

//żeby dodać komentarz
app.post('/Komentarz', (req, res) => {
  if (req.user) {
    Pytanie(baza, 5, { komentarz: req.body.komentarz, autor: req.session.passport.user.username, link: req.body.gdzie }).then(
      res.status(200).send("Sukces")
    );
  } else {
    Pytanie(baza, 5, { komentarz: req.body.komentarz, autor: "", link: req.body.gdzie }).then(
      res.status(200).send("Sukces")
    );
  }
});

//usuwa komentarze
app.post('/usunkom', (req, res) => {
  Pytanie(baza, 11, req.body.kom).then(
    res.status(200).send("Sukces")
  );
});

//zmienia rolę użytkownika
app.post('/zmien', (req, res) => {
  Pytanie(baza, 9, req.body.kto).then(
    res.status(200).send("Sukces")
  );
});

//usuwa artykuł
app.post('/usunart', (req, res) => {
  Pytanie(baza, 10, req.body.ktory).then(
    res.status(200).send("Sukces")
  );
});

//zwiększa liczbę chmurek bądź słońc
app.post('/zwiekszLiczbe', (req, res) => {
  Pytanie(baza, 7, { gdzie: req.body.gdzie, co: req.body.rodzaj }).then(
    res.status(200).send("Sukces")
  );
});

//żeby się wylogować
app.get('/Logout', (req, res) => {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

//logowanie
app.route('/Login')
  .post(passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/Login?error=true',
    failureFlash: true
  }))
  .get(function (req, res) {
    // Sprawdzenie czy parametr "error" jest obecny w zapytaniu
    if (req.query.error) {
      res.render('login', { title: 'Logowanie', message: 'Błędna nazwa użytkownika bądź hasło' });
    } else {
      // Obsługa standardowego żądania GET na '/Login'
      if (req.user) {
        res.redirect('/');
      } else {
        res.render('login', { title: 'Logowanie', message: 'Zaloguj się!' });
      }
    }
  });

//Rejestracja
app.route('/Rejestracja')
  .post(function (req, res, next) {
    Pytanie(baza, 2, { login: req.body.username, haslo: req.body.password })
      .then((odpowiedz) => {
        res.render('register', { title: 'Rejestracja', message: odpowiedz });
      })
      .catch((error) => {
        res.render('register', { title: 'Rejestracja', message: 'Coś się popsuło!' });
        console.error("Błąd:", error);
      });
  })
  .all(function (req, res, next) {
    if (req.user) {
      res.redirect('/');
    } else {
      res.render('register', { title: 'Rejestracja', message: 'Zarejestruj się!' });
    }
  });

//jeśli nie znajdzie strony
app.use((req, res, next) => {
  res.status(404).send("Błąd 404 Nie ma czegoś takiego! <br> <a href='/'>Wróć do strony głównej</a>")
});

//jeśli odpowie błędem
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Coś sie popsuło po stronie serwera!!! <br> <a href=' / '>Wróć do strony głównej</a>')
});

//inicjalizacja serwera
app.listen(8080, () => {
  console.log(`server started`)
});


