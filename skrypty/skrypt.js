function showCustomMenu(){
    document.getElementById("menu").hidden = false;
}

window.oncontextmenu = function ()
{
    showCustomMenu();
    return false;     // cancel default menu
}