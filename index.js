//pliki!!
// Wczytaj dane z pliku .json
const tajnyklucz = require("./rzeczy.json");
//do logowania
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const express = require('express');
const session = require('express-session');
const app = express();
const bodyParser = require('body-parser');
const crypto = require('crypto');
const Pytanie = require('./DatabaseHandl.js');
//serwer połączenie
var admin = require("firebase-admin");
const { resolve } = require('path');
let sformatowane;
let opcje = { year: 'numeric', month: 'long', day: 'numeric' };
let artid;

admin.initializeApp({
  credential: admin.credential.cert(tajnyklucz),
  databaseURL: "https://data-y6-default-rtdb.europe-west1.firebasedatabase.app"
});;
const baza = admin.database();

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username, rola: user.rola });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

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

app.use(session({
  secret: crypto.randomBytes(32).toString('hex'), // Sekretny klucz dla sesji
  resave: true,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('session'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('views'));
app.set('view engine', 'pug');
app.use(flash());

const PORT = process.env.PORT || 3030;

//wszystkie drogi prowadzą do mojej strony
//strona główna

app.route('/')
  .all(function (req, res, next) {
    Pytanie(baza, 1, "aaa")
      .then((odpowiedz) => {
        res.render('index', {
          title: 'Strona Główna', message: odpowiedz, dane_uz: req.user
        });
      })
      .catch((error) => {
        res.render('index', { title: 'Strona Główna', message: "" });
        console.error("Błąd:", error);
      });
  });

app.route('/Onas')
  .all(function (req, res, next) {
    res.render('Onas', {
      title: 'O nas', dane_uz: req.user
    })
  });

//Pokazuje wszystkie artykuły
app.route('/Nartykuly')
  .all(function (req, res, next) {
    Pytanie(baza, 6, "")
      .then((odpowiedz) => {
        res.render('wszystkiekury', { title: 'Najnowsze artykuły', message: odpowiedz, dane_uz: req.user });
      }).catch((error) => {
        res.render('index', {
          title: 'Strona Główna', message: "", dane_uz: req.user
        });
        console.error("Błąd:", error);
      });

  });

//droga do artykułów
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
          dane_uz: req.user,
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
    res.render('artykul', { title: 'Artykuł', message: 'Taki artykuł nie istnieje!', dane_uz: req.user });
  }

});

//nowy artykuł
app.route('/admin')
  .post(function (req, res, next) {
    if ((req.isAuthenticated()) && (req.user.rola == 'administrator')) {
      Pytanie(baza, 9, { id: req.user.id, tresc: req.body.tresc, tytul: req.body.tytul, zdjc: req.body.zdjc, tagi: req.body.tagi }).then(
        res.redirect('/admin'));
    } else {
      res.redirect('/Login');
    }
  })
  .all(function (req, res, next) {
    if ((req.isAuthenticated()) && (req.user.rola == 'administrator')) {
      Pytanie(baza, 8).then((cos) => {
        res.render('admin', { cos, dane_uz: req.user });
      }
      );
    } else {
      res.redirect('/Login');
    }
  });

//nowy artykuł
app.route('/nowy')
  .post(function (req, res, next) {
    if (req.isAuthenticated()) {
      Pytanie(baza, 3, { id: req.user.id, tresc: req.body.tresc, tytul: req.body.tytul, zdjc: req.body.zdjc, tagi: req.body.tagi }).then(
        res.redirect('/nowy'));
    } else {
      res.redirect('/Login');
    }
  })
  .all(function (req, res, next) {
    if (req.isAuthenticated()) {
      res.render('nowyrykul', { title: 'Nowy artykuł', dane_uz: req.user });
    } else {
      res.redirect('/Login');
    }
  });

//żeby dodać komentarz
app.post('/Komentarz', (req, res) => {
  if (req.user) {
    Pytanie(baza, 5, { komentarz: req.body.komentarz, autor: req.user.username, link: req.body.gdzie }).then(
      res.status(200).send("Sukces")
    );
  } else {
    Pytanie(baza, 5, { komentarz: req.body.komentarz, autor: "", link: req.body.gdzie }).then(
      res.status(200).send("Sukces")
    );
  }
});

//zmienia rolę użytkownika
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
    failureRedirect: '/Login',
    failureFlash: true
  }))
  .all(function (req, res, next) {
    res.render('login', { title: 'Logowanie', message: 'Zaloguj się!' });
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
    res.render('register', { title: 'Rejestracja', message: 'Zarejestruj się!' });
  });

//jeśli nie znajdzie strony
app.use((req, res, next) => {
  res.status(404).send("Nie ma czegoś takiego!")
});

//jeśli odpowie błędem
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Coś sie popsuło!!!')
});

//inicjalizacja serwera
app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});


