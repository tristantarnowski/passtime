document.getElementById("min-elevation").addEventListener("blur", handleMinElevationBlur, false);
document.getElementById("num-days").addEventListener("blur", handleNumDaysBlur, false);
document.getElementById("min-elevation").addEventListener("change", handleMinElevationBlur, false);
document.getElementById("num-days").addEventListener("change", handleNumDaysBlur, false);

handleMinElevationBlur();
handleNumDaysBlur();

function handleMinElevationBlur() {
    if (document.getElementById("min-elevation").validity.valid) {
        globals.minElevation = document.getElementById("min-elevation").value;
    }
}

function handleNumDaysBlur() {
    if (document.getElementById("num-days").validity.valid) {
        globals.numDays = document.getElementById("num-days").value;
    }
}