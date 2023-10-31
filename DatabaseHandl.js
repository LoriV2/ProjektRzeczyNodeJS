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
                        tagi: slowa.tagi.replace(/\s+/g, ''),
                        tresc: slowa.tresc,
                        tytul: slowa.tytul,
                        zdjc: slowa.zdjc,
                        chmurki: 0,
                        slonca: 0,
                    })
                    resolve("Pomyślnie dodano artykuł");
                    break;
                case 4:
                    //wczytaj artykuł
                    let odpowiedzostateczna =
                    {
                        tagi: "",
                        tytul_art: "",
                        data_dodania_art: "",
                        tresc: "",
                        zdjc: "",
                        autor_art: "",
                        chmurki: 0,
                        slonca: 0,
                        komentarze: {},
                    };
                    await baza.ref('komentarze/' + slowa).once('value', (snapshot3) => {
                        const odpowiedz3 = snapshot3.val();
                        odpowiedzostateczna.komentarze = odpowiedz3;
                    })
                    await baza.ref('artykuly').child(slowa).once('value', (snapshot2) => {
                        const odpowiedz2 = snapshot2.val();
                        odpowiedzostateczna.tagi = odpowiedz2.tagi;
                        odpowiedzostateczna.tytul_art = odpowiedz2.tytul;
                        odpowiedzostateczna.data_dodania_art = odpowiedz2.data_publikacji;
                        odpowiedzostateczna.tresc = odpowiedz2.tresc;
                        odpowiedzostateczna.zdjc = odpowiedz2.zdjc;
                        odpowiedzostateczna.chmurki = odpowiedz2.chmurki;
                        odpowiedzostateczna.slonca = odpowiedz2.slonca;
                        resolve(odpowiedzostateczna);
                    });
                    break;
                case 5:
                    //dodawanie komentarzy
                    await baza.ref('komentarze/' + slowa.link).push({
                        tresc: slowa.komentarz,
                        autor: slowa.autor,
                        data_dodania: new Date().getTime(),
                    })
                    resolve("działa");
                    break;
                case 6:
                    //Wszystkie podstrony
                    const snapshot5 = await baza.ref('artykuly').orderByChild('data_publikacji').once('value');
                    const odpowiedz5 = snapshot5.val();
                    resolve(odpowiedz5);
                    break;
                //zwiększa liczbę chmurek bądź słońc
                case 7:
                    await baza.ref("artykuly/" + slowa.gdzie + "/" + slowa.co).transaction((currentValue) => {
                        return (currentValue || 0) + 1;
                    }, (error, committed, snapshot) => {
                        if (error) {
                            console.error('Błąd podczas aktualizacji liczby: ', error);
                        } else {
                            resolve(snapshot.val());
                        }
                    });
                    break;
                default:
                    reject("Nieprawidłowy numer przypadku");
                    break;
            }
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = Pytanie;