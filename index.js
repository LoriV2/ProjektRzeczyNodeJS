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
//serwer połączenie
var admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(tajnyklucz),
  databaseURL: "https://data-y6-default-rtdb.europe-west1.firebasedatabase.app"
});;
const baza = admin.database();

passport.serializeUser(function (user, cb) {
  console.log(user);
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
          console.log("coś nie tak z hasłem");
          return done(null, false, { message: 'Nieprawidłowe hasło' });
        }
      } else {
        console.log("coś nie tak z loginem");
        return done(null, false, { message: 'Nieprawidłowy login' });
      }
    })
  }
));

app.use(session({
  secret: crypto.randomBytes(32).toString('hex'), // Sekretny klucz dla sesji
  resave: false,
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

async function Pytanie(baza, x, slowa) {
  return new Promise(async (resolve, reject) => {
    try {
      switch (x) {
        case 1:
          const snapshot = await baza.ref('artykuly').orderByChild('data_publikacji').limitToLast(4).once('value');
          const odpowiedz = snapshot.val();
          resolve(odpowiedz);
          break;
        case 2:
          await baza.ref('uzytkownicy').orderByChild('login').equalTo(slowa.login).once('value', (cos) => {
            if (cos.exists()) {
              resolve("Użytkownik o loginie: " + slowa.login + " już istnieje");
            } else {
              baza.ref('uzytkownicy').push({
                rola: "użytkownik",
                login: slowa.login,
                haslo: crypto.createHash('sha256').update(slowa.haslo).digest('hex'),
                data_dolaczenia: new Date().getTime()
              });
            }
          })
          resolve("Pomyślnie zarejestrowano: " + slowa.login);
          break;
        case 3:
          console.log(slowa);
          await baza.ref('artykuly').push({
            data_publikacji: new Date().getTime(),
            tresc: slowa.tresc,
            tytul: slowa.tytul,
            zdjc: slowa.zdjc
          })
          resolve("Pomyślnie dodano artykuł");
          break;
        case 4:
          const snapshot2 = await baza.ref('artykuly').orderByChild('').equalTo(slowa.id).once('value');
          const odpowiedz2 = snapshot2.val();
          resolve(odpowiedz2);
          break;
        default:
          console.log("nie działa");
          reject("Nieprawidłowy numer przypadku");
          break;
      }
    } catch (error) {
      reject(error);
    }
  });
}
function isAuth(req) {
  if (req.session.passport !== undefined) {
    id = req.session.passport.user.id;
    username = req.session.passport.user.username;
    rola = req.session.passport.user.rola;
    return true;
  } else {
    id = "";
    username = "";
    rola = "";
    return false;
  }

}
let id = "";
let username = "";
let rola = "";
const PORT = process.env.PORT || 3030;
//wszystkie drogi prowadzą do mojej strony
app.route('/')
  .all(function (req, res, next) {
    Pytanie(baza, 1, "aaa")
      .then((odpowiedz) => {
        res.render('index', {
          title: 'Strona Główna', message: odpowiedz, id, username, rola
        });
      })
      .catch((error) => {
        res.render('index', { title: 'Strona Główna', message: "" });
        console.error("Błąd:", error);
      });
  });

app.get('/artykul', (req, res) => {
  res.send(req.query);
});

app.get('/Logout', (req, res) => {
  req.logout(function (err) {
    id = "";
    username = "";
    rola = "";
    if (err) { return next(err); }
    res.redirect('/');
  });
});

app.route('/nowy')
  .post(function (req, res, next) {
    Pytanie(baza, 3, { id: id, tresc: req.body.tresc, tytul: req.body.tytul, zdjc: req.body.zdjc, });
    res.redirect('/nowy');
  }
  )
  .all(function (req, res, next) {
    if (isAuth(req) == true) {
      res.render('nowyrykul', { title: 'Nowy artykuł' });
    } else {
      res.redirect('/Login');
    }
  });

app.route('/Login')
  .post(passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/Login',
    failureFlash: true
  }))
  .all(function (req, res, next) {
    res.render('login', { title: 'Logowanie', message: 'Zaloguj się!' });
  });

app.route('/Rejestracja')
  .post(function (req, res, next) {
    Pytanie(baza, 2, { login: req.body.username, haslo: req.body.password })
      .then((odpowiedz) => {
        res.render('register', { title: 'Rejestracja', message: odpowiedz });
      })
      .catch((error) => {
        res.render('register', { title: 'Rejestracja', message: 'Zarejestruj się!' });
        console.error("Błąd:", error);
      });
  })
  .all(function (req, res, next) {
    res.render('register', { title: 'Rejestracja', message: 'Zarejestruj się!' });
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


