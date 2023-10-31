let opcje = { year: 'numeric', month: 'long', day: 'numeric' },
    poprzedni;
var options = {
    valueNames: ['tytul', 'tresc', 'chmurki', 'data', 'slonca', 'tagi']
},
    hackerList = new List('lista', options);

//funkcja od zmieniania strzałki na przyciskach sortowania
// x = przycisk który został kliknięty;
//zapisuje poprzedni w razie kliknięcia innego przycisku;
function zmien(x) {
    if (x.innerHTML.search("▼") > -1) {
        x.innerHTML = x.innerHTML.replace("▼", "▲");
    } else if (x.innerHTML.search("▲") > -1) {
        x.innerHTML = x.innerHTML.replace("▲", "▼");
    } else {
        if (poprzedni) {
            poprzedni.innerHTML = poprzedni.innerHTML.replace("▲", "");
            poprzedni.innerHTML = poprzedni.innerHTML.replace("▼", "");
        }
        x.innerHTML += " ▲";
    }
    poprzedni = x;
}