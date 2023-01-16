document.getElementById("tle-form").addEventListener("submit", event => { handleTleFormSubmit(event); event.preventDefault(); }, false);
document.getElementById("tle-input").addEventListener("blur", handleTleInputBlur, false);

fetchCelestrakTleByCatNum(55126);
compute(globals.line1, globals.line2);



function handleTleFormSubmit(event) {
    const catNumInput = event.target.elements["catnum-input"];
    catNumInput.blur();

    if (catNumInput.validity.valid) {
        fetchCelestrakTleByCatNum(catNumInput.value);
    }
}


function fetchCelestrakTleByCatNum(catNum) {
    const url = "https://celestrak.org/NORAD/elements/gp.php?CATNR=" + catNum;

    const req = new XMLHttpRequest();
    req.addEventListener("load", () => {
        updateTle(req.responseText);
    });
    req.open("GET", url, false);
    req.send();
}

function updateTle(text) {
    const tle = parseTle(text);
    globals.line1 = tle.line1;
    globals.line2 = tle.line2;

    for (const element of document.getElementsByClassName("tle-text")) {
        element.value = text;
    }
}

function handleTleInputBlur() {
    const text = document.getElementById("tle-input").value;
    updateTle(text);
}


function parseTle(text) {

    // good inputs
    // 1 1231231
    // 1 123123
    // 2 123123

    // ORCASAT
    // 1 123125
    // 2 910923

    // 1 19293
    // 2 1091238

    let lines = text.trim().split(/\r?\n/);
    console.log(lines);
    if (lines.length > 2) {
        lines.shift();
    }

    return {
        line1: lines[0],
        line2: lines[1]
    }
}


