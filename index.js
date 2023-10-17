//pliki!!
// Wczytaj dane z pliku .json
const tajnyklucz = require("./rzeczy.json");
//do logowania
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const crypto = require('crypto');
//serwer połączenie
var admin = require("firebase-admin");



admin.initializeApp({
  credential: admin.credential.cert(tajnyklucz),
  databaseURL: "https://data-y6-default-rtdb.europe-west1.firebasedatabase.app"
});;
const baza = admin.database();

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

app.use(express.json());
app.use(express.static('views'));
app.set('view engine', 'pug');

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
  .all(function (req, res, next) {
    res.render('login', { title: 'Logowanie', message: 'Zaloguj się!' });
  })
  .post(function (req, res, next) {
    res.render('login', { title: 'Logowanie', message: 'Zalogowano' });
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


