let opcje = { year: 'numeric', month: 'long', day: 'numeric' };
let sformatowane;
let id = ""
function daty(data) {
    data = new Date(data);
    sformatowane = data.toLocaleDateString(undefined, opcje);
    return sformatowane;
}