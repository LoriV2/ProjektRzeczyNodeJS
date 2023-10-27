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
          //strona główna
          const snapshot = await baza.ref('artykuly').orderByChild('data_publikacji').limitToLast(4).once('value');
          const odpowiedz = snapshot.val();
          resolve(odpowiedz);
          break;
        case 6:
          //strona główna
          const snapshot5 = await baza.ref('artykuly').orderByChild('data_publikacji').once('value');
          const odpowiedz5 = snapshot5.val();
          resolve(odpowiedz5);
          break;
        case 2:
          //rejestracja
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
          //nowy artykuł
          await baza.ref('artykuly').push({
            data_publikacji: new Date().getTime(),
            tresc: slowa.tresc,
            tytul: slowa.tytul,
            zdjc: slowa.zdjc,
            chmurki: { ilosc: 0, kto: ["ktosid"], },
            slonca: { ilosc: 0, kto: ["ktosid"], }
          })
          resolve("Pomyślnie dodano artykuł");
          break;
        case 4:
          //wczytaj artykuł
          let odpowiedzostateczna =
          {
            tytul_art: "",
            data_dodania_art: "",
            tresc: "",
            zdjc: "",
            autor_art: "",
            chmurki: 0,
            slonca: 0,
            komentarze: {},
          };
          await baza.ref('komentarze').orderByChild('artykul').equalTo(slowa).once('value', (snapshot3) => {
            const odpowiedz3 = snapshot3.val();
            odpowiedzostateczna.komentarze = odpowiedz3;
          })
          await baza.ref('artykuly').child(slowa).once('value', (snapshot2) => {

            const odpowiedz2 = snapshot2.val();
            odpowiedzostateczna.tytul_art = odpowiedz2.tytul;
            odpowiedzostateczna.data_dodania_art = odpowiedz2.data_publikacji;
            odpowiedzostateczna.tresc = odpowiedz2.tresc;
            odpowiedzostateczna.zdjc = odpowiedz2.zdjc;
            odpowiedzostateczna.chmurki = odpowiedz2.chmurki;
            odpowiedzostateczna.slonca = odpowiedz2.slonca;
            console.log(odpowiedzostateczna);
            resolve(odpowiedzostateczna);
          });
          break;
        case 5:
          //dodawanie komentarzy
          await baza.ref('komentarze').push({
            artykul: slowa.link,
            tresc: slowa.komentarz,
            autor: slowa.autor,
            data_dodania: new Date().getTime(),
          })
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
//strona główna

app.route('/')
  .all(function (req, res, next) {
    Pytanie(baza, 1, "aaa")
      .then((odpowiedz) => {
        isAuth(req);
        res.render('index', {
          title: 'Strona Główna', message: odpowiedz, id, username, rola
        });
      })
      .catch((error) => {
        isAuth(req);
        res.render('index', { title: 'Strona Główna', message: "" });
        console.error("Błąd:", error);
      });
  });

//droga do artykułów
app.get('/artykul', (req, res) => {
  if (req.query.nr != undefined) {
    Pytanie(baza, 4, req.query.nr)
      .then((odpowiedz) => {
        isAuth(req);
        res.render('artykul', { title: odpowiedz.tytul_art, message: odpowiedz, id, username, rola, doprzycisku: req.query.nr, komentarze: odpowiedz.komentarze });
      })
      .catch((error) => {
        isAuth(req);
        res.redirect('/');
        console.error("Błąd:", error);
      });
  } else {
    res.render('artykul', { title: 'Artykuł', message: 'Taki artykuł nie istnieje!', id, username, rola });
  }

});

//żeby się wylogować
app.post('/Komentarz', (req, res) => {
  let link = req.headers.referer;
  let pozycja = link.search(/nr/);
  link = link.slice(pozycja + 3);
  Pytanie(baza, 5, { "komentarz": req.body.komentarz, "autor": username, link }).then(
    res.redirect(req.headers.referer)
  )
});


//żeby się wylogować
app.get('/Logout', (req, res) => {
  req.logout(function (err) {
    id = "";
    username = "";
    rola = "";
    if (err) { return next(err); }
    res.redirect('/');
  });
});

//nowy artykuł
app.route('/nowy')
  .post(function (req, res, next) {
    Pytanie(baza, 3, { id: id, tresc: req.body.tresc, tytul: req.body.tytul, zdjc: req.body.zdjc, });
    res.redirect('/nowy');
  }
  )
  .all(function (req, res, next) {
    if ((isAuth(req) == true)) {
      res.render('nowyrykul', { title: 'Nowy artykuł', id, username, rola });
    } else {
      res.redirect('/Login');
    }
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
        res.render('register', { title: 'Rejestracja', message: 'Zarejestruj się!' });
        console.error("Błąd:", error);
      });
  })
  .all(function (req, res, next) {
    res.render('register', { title: 'Rejestracja', message: 'Zarejestruj się!' });
  });

//W trakcie tworzenia
app.route('/Nartykuly')
  .all(function (req, res, next) {
    isAuth(req);
    Pytanie(baza, 6, "")
      .then((odpowiedz) => {
        res.render('wszystkiekury', { title: 'Najnowsze artykuły', message: odpowiedz, id, username, rola, id });
      }).catch((error) => {
        res.render('index', {
          title: 'Strona Główna', message: odpowiedz, id, username, rola
        });
        console.error("Błąd:", error);
      });

  });

//jeśli nie znajdzie strony
app.use((req, res, next) => {
  isAuth(req);
  res.status(404).send("Nie ma czegoś takiego!")
});

//jeśli odpowie błędem
app.use((err, req, res, next) => {
  console.error(err.stack);
  isAuth(req);
  res.status(500).send('Coś sie popsuło!!!')
});

//inicjalizacja serwera
app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});


