let globals = {
    latitude: 48.4612,
    longitude: -123.3100,
    height: 0,
    name: "UVic"
}

document.getElementById("get-location-button").addEventListener("click", handleGeolocate, false);
document.getElementById("store-location-button").addEventListener("click", handleStoreLocation, false);
document.getElementById("locations-select").addEventListener("change", handleLocationSelect, false);
document.getElementById("obs-form").addEventListener("blur", event => { handleCoordsFormInput(event) }, true);
document.getElementById("obs-form").addEventListener("submit", event => { handleCoordsFormInput(event); event.preventDefault(); }, true);
document.getElementById("clear-stored-locations").addEventListener("click", handleClearStoredLocations, false);

storeLocationWithName(globals.name, { latitude: globals.latitude, longitude: globals.longitude, height: globals.height });
updateLocationsList();
updateLocationDisplay();

function handleClearStoredLocations() {
    localStorage.setItem("locations", "{}");
    updateLocationsList();
    document.getElementById("locations-select").selectedIndex = 0;
}

function handleCoordsFormInput(event) {
    const input_lat = document.getElementById("obs-lat").value;
    if (input_lat <= 90 && input_lat >= -90 && globals.latitude != input_lat) {
        globals.latitude = input_lat;
        globals.name = "Manual Input";
        document.getElementById("locations-select").selectedIndex = 0;
    }

    const input_long = document.getElementById("obs-long").value;
    if (input_long <= 180 && input_long >= -180 && globals.longitude != input_long) {
        globals.longitude = input_long;
        globals.name = "Manual Input";
        document.getElementById("locations-select").selectedIndex = 0;
    }

    const input_height = document.getElementById("obs-elevation").value;
    if (input_height >= 0 && globals.height != input_height) {
        globals.height = input_height;
        globals.name = "Manual Input";
        document.getElementById("locations-select").selectedIndex = 0;
    }

    updateLocationDisplay();
}

function handleLocationSelect() {
    let storedLocationsArray = JSON.parse(localStorage.getItem("locations"));
    let loc = this.value;

    let obj = storedLocationsArray[loc];

    console.log(obj.latitude);

    globals.latitude = obj.latitude;
    globals.longitude = obj.longitude;
    globals.height = obj.height;
    globals.name = loc;

    updateLocationDisplay();
}

function handleGeolocate() {
    navigator.geolocation.getCurrentPosition(position => {
        globals.latitude = position.coords.latitude;
        globals.longitude = position.coords.longitude;

        if (position.coords.altitude == null) {
            globals.height = 0;
        } else {
            globals.height = position.coords.altitude;
        }

        globals.name = "Browser Location";

        updateLocationDisplay();
        document.getElementById("locations-select").selectedIndex = 0;
    });
}

function updateLocationDisplay() {
    for (const element of document.getElementsByClassName("location-name")) {
        element.textContent = globals.name;
    }

    document.getElementById("obs-lat").value = globals.latitude;
    document.getElementById("obs-long").value = globals.longitude;
    document.getElementById("obs-elevation").value = globals.height;

    document.getElementById("obs-lat").blur();
    document.getElementById("obs-long").blur();
    document.getElementById("obs-elevation").blur();
}


function handleStoreLocation() {
    let name = "";
    while (name == "") {
        name = prompt("Enter a name for this location");
    }

    if (name == null) {
        return;
    }

    let location = {
        latitude: globals.latitude,
        longitude: globals.longitude,
        height: globals.height
    };

    storeLocationWithName(name, location);

    updateLocationsList();
    document.getElementById("locations-select").value = name;
    document.getElementById("locations-select").dispatchEvent(new Event("change"));
}

function storeLocationWithName(name, location) {
    let storedLocationsArray = JSON.parse(localStorage.getItem("locations")) || {};
    storedLocationsArray[name] = location;
    localStorage.setItem("locations", JSON.stringify(storedLocationsArray));
}


function updateLocationsList() {
    let selector = document.getElementById("locations-select");
    selector.removeEventListener("change", handleLocationSelect, false);
    let storedLocationsArray = JSON.parse(localStorage.getItem("locations"));

    // for (option in selector.options) {
    //     selector.options.remove(0);
    // }

    for (let i = 1; i < selector.options.length; i++) {
        selector.options.remove(1);
    }

    for (var location in storedLocationsArray) {
        var option = document.createElement("option");
        option.value = location;
        option.innerHTML = location;
        selector.appendChild(option);
    }
    selector.addEventListener("change", handleLocationSelect, false);
}