let opcje = { year: 'numeric', month: 'long', day: 'numeric' };
let sformatowane;
function daty(data) {
    data = new Date(data);
    sformatowane = data.toLocaleDateString(undefined, opcje);
}