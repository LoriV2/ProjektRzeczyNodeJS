//pliki!!
// Wczytaj dane z pliku .json
const tajnyklucz = require("./rzeczy.json");
//do logowania
const express = require('express');
const app = express();
//serwer połączenie
var admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(tajnyklucz),
  databaseURL: "https://data-y6-default-rtdb.europe-west1.firebasedatabase.app"
});;
const baza = admin.database();
async function Pytanie(baza) {
  await baza.ref('uzytkownicy').once('value', (snapshot) => {
    const data = snapshot.val();
    console.log(data);
    dataa = data;
  })
}

console.log(Pytanie(baza));

app.use(express.json());
app.use(express.static('views'));
app.set('view engine', 'pug');

const PORT = process.env.PORT || 3030;
//wszystkie drogi prowadzą do mojej strony
app.route('/')
  .all(function (req, res, next) {
    baza.ref('artykuly').once('value', (snapshot) => {
      const data = snapshot.val();
      res.render('index', { title: 'Strona Główna', message: data });
    })

  });

app.get('/Logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.route('/Login')
  .all(function (req, res, next) {
    res.render('login', { title: 'Logowanie' });
  })

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


