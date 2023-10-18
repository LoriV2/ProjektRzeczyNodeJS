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

passport.serializeUser((user, done) => {
  // W user powinny znajdować się tylko informacje potrzebne do identyfikacji użytkownika w sesji
  // Na przykład, jeśli user jest obiektem zawierającym ID użytkownika, możesz zrobić coś takiego:
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  // Tutaj będziesz miał dostęp do wartości ID zserializowanej wcześniej w sesji
  // Na przykład, możesz pobrać użytkownika z bazy danych na podstawie tego ID
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  (username, password, done) => {
    baza.ref('uzytkownicy').orderByChild('login').equalTo(username).once('value', (cos) => {
      if (cos.exists()) {
        if ((crypto.createHash('sha256').update(password).digest('hex')) === (cos.val()[Object.keys(cos.val())[0]].haslo)) {
          passport.serializeUser((user, done) => {
            done(null, user.id);
          });
          return done(null, { id: Object.keys(cos.val())[0], message: cos.val().login, rola: cos.val().rola });
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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('views'));
app.set('view engine', 'pug');
app.use(flash());

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

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
          // Twoja logika dla przypadku 3
          resolve("Odpowiedź dla przypadku 3");
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

const PORT = process.env.PORT || 3030;
//wszystkie drogi prowadzą do mojej strony
app.route('/')
  .all(function (req, res, next) {
    Pytanie(baza, 1, "aaa")
      .then((odpowiedz) => {
        res.render('index', { title: 'Strona Główna', message: odpowiedz });
      })
      .catch((error) => {
        res.render('index', { title: 'Strona Główna', message: "" });
        console.error("Błąd:", error);
      });

  });

app.get('/Logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/nowy', (req, res) => {
  res.render('nowyrykul', { title: 'Nowy artykuł' });
})
  .post('/nowy', (req, res) => {
    res.render('nowyrykul', { title: 'Nowy artykuł' });
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


