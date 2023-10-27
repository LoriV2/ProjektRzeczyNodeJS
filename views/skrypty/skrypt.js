let opcje = { year: 'numeric', month: 'long', day: 'numeric' };
let sformatowane;
let id = ""
async function daty(data , id) {
    console.log(id);
    data = new Date(data);
    sformatowane = data.toLocaleDateString(undefined, opcje);
    window.alert("aa");
}