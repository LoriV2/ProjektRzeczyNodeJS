# ProjektRzeczyNodeJS

~~Projekt jakim jest ta strona będzie polegać na tym że jak będę miał pomysł na jakieś fajne funkcje to zrobię je w temacie jakie pasują do tej funkcji coś jak antologia ale z podstron.~~

~~Obecnie na stronie: gif mający ukazać trybiące trybiki~~

~~Funkcje w opracowaniu: Własne context menu~~

~~Funkcje w trakcie wymyślania: Minigry, Rejestracja, Logowanie, Szata graficzna,~~

***

https://yapp2go.fly.dev/
Link do strony

## Główne założenia

***

#### **S**trona o nazwie "Yapp2go" z logiem "Y" jest zbudowana w technologii node js i wykorzystuje następujące biblioteki:

* Express.js
* Express-session.js
* Passport.js
* Passport-local.js
* Pug.js
* dotenv
* connect-flash
* sass
* scss
* Crypto.js
* firebase-admin



***

#### Strona jest stroną z artykułami o tematyce przeróżnej. Na stronie jest wiele funkcji które dzielą się na:

### Dostępne dla wszystkich:

* Przeglądanie artykułów
* Komentowanie
* Możliwość rejestracji
* Możliwość zalogowania się

### Dostępne dla zalogowanych użytkowników:

* To samo co dla wszystkich powyższych
* Widoczność własnej nazwy użytkownika w komentarzach

### Dostępne dla pracowników:

* To samo co dla wszystkich powyższych
* Tworzenie artykułów
* Usuwanie artykułów
* Usuwanie komentarzy

### Dostępne dla administratora:

* To samo co dla wszystkich powyższych
* Możliwość zmiany roli użytkowników



***

## Omówienie najważniejszych plików

<figure><img src=".gitbook/assets/Zrzut ekranu 2023-11-04 142437.jpg" alt="Tutaj powinna być struktura plików w projekcie"><figcaption><p>Struktura plików w projekcie</p></figcaption></figure>

### index.js:

* Jest to plik serwera
* Łączy się z bazą danych firebase
* Ten plik wysyła dane do podstron aby działały prawidłowo
* Użytkownik strony nie ma dostępu do tego pliku podczas działania strony

### DatabaseHandl.js:

* W pliku znajduje się jedna funkcja wykonująca zapytania do bazy danych

### Folder views:

* Zawiera wszystkie pliki które są do wglądu dla użytkownika takie jak podstrony czy szaty graficzne
* Tylko te pliki są wysyłane użytkownikowi podczas działania strony

### Folder node\_modules:

* Mieszczą się w nim wszystkie biblioteki



***

## Przyszłość projektu

W bardzo dalekiej przyszłości planuję dodać więcej funkcji, ulepszyć szatę graficzną oraz hostować stronę na lepszych serwerach
