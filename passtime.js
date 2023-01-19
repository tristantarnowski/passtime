function altAzDegrees(satrec, station, date) {
    const gmst = satellite.gstime(date),
        eci = satellite.propagate(satrec, date),
        ecf = satellite.eciToEcf(eci.position, gmst),
        angles = satellite.ecfToLookAngles(station, ecf);

    return {
        altitude: satellite.radiansToDegrees(angles.elevation),
        azimuth: satellite.radiansToDegrees(angles.azimuth),
        range: angles.rangeSat
    };
}

function altDegrees(satrec, station, date) {
    const altaz = altAzDegrees(satrec, station, date);
    return altaz.altitude;
}

function findMaxima(start_time, end_time, f) {
    const step_ms = 500;
    let t = start_time;

    let maxima = [];
    // if t_i+1 < t_i and t_i-1 < t_i, found max
    let y_prev = f(new Date(start_time - step_ms));
    let y_next = f(new Date(start_time + step_ms));
    let y = f(t);

    while (t <= end_time) {
        y_next = f(new Date(t + step_ms));
        if (y > y_prev && y > 0 && y > y_next) {
            let obj = {};
            obj.t = t;
            obj.y = y;
            maxima.push(obj);
        }
        y_prev = y;
        y = y_next;
        t += step_ms;

    }

    return maxima;
}

// Return the first instance of val between start and end
function findValue(start, end, val, f) {
    const abs_time = Math.abs(end - start);
    const step_ms = 100;
    // If start is after end, step backwards


    let elapsed_t = 0;
    let t = start;
    let y_prev = f(new Date(t));
    let t_prev = 0;
    while (elapsed_t < abs_time) {

        let y = f(new Date(t));
        // check if val is between y and y_prev
        if ((y < val && y_prev > val) || (y > val && y_prev < val)) {
            // check if val is closer to y or y_prev
            if (Math.abs(y - val) < Math.abs(y_prev - val)) {
                return t;
            } else {
                return t_prev;
            }
        }
        y_prev = y;
        t_prev = t;
        elapsed_t += step_ms;

        if (start > end) {
            t -= step_ms;
        } else {
            t += step_ms;
        }

    }
}

function getPasses(satrec, station, start, end, degrees) {
    // Find maximum altitudes and times
    const f = altDegrees.bind(null, satrec, station);
    let maxima = findMaxima(start.getTime(), end.getTime(), f);
    maxima = maxima.filter(pass => pass.y > degrees);

    let passes = [];

    // for a highly eliptical orbit with axis aligned with GS, maximum pass length is roughly 1/2 of orbit
    const max_pass_length_s = getPeriod(satrec.no_kozai) / 2;

    for (const pass of maxima) {
        let obj = {};
        obj.end = findValue(pass.t, pass.t + max_pass_length_s / 2 * 1000, degrees, f);
        obj.start = findValue(pass.t, pass.t - max_pass_length_s / 2 * 1000, degrees, f);
        obj.max = pass.y;
        passes.push(obj);
    }

    return passes;
}

function getPeriod(kozaiMeanMotion) {
    const meanMotion = kozaiMeanMotion / 2 / Math.PI * 24 * 60; // rev/day
    const period = 86400 / meanMotion; // s/rev
    return period;
}

function compute(line1, line2) {
    const satrec = satellite.twoline2satrec(line1, line2);

    const station = {
        latitude: satellite.degreesToRadians(globals.latitude),
        longitude: satellite.degreesToRadians(globals.longitude),
        height: globals.height
    }

    const start = new Date();
    const end = new Date(start.getTime() + 86400000 * globals.numDays);
    const passes = getPasses(satrec, station, start, end, globals.minElevation);

    populateTable(passes);
    displaySatrecInfo(satrec);
}

function populateTable(passes) {
    const table = document.getElementById("passes-table");

    while (table.tBodies.length > 0) {
        table.tBodies[0].remove();
    }

    let prevStartTime = 0;

    for (const pass of passes) {
        const startTime = new Date(pass.start);
        const maxElevationText = pass.max.toFixed(1);
        const durationText = ((pass.end - pass.start) / 1000).toFixed(0);

        // TODO calculate max time between passes based on mean motion
        const maxTimeBetweenPasses = 6000;

        if ((startTime - prevStartTime) / 1000 > maxTimeBetweenPasses) {
            var tbody = document.createElement("tbody");
            table.appendChild(tbody);
        }

        prevStartTime = startTime;
        makeRow(tbody, startTime.toLocaleString(), maxElevationText, durationText);
    }
}

function makeRow(tBody, ...args) {
    // const tbody = tBody;
    const row = tBody.insertRow();
    for (const arg of args) {
        const text_node = document.createTextNode(arg);
        row.insertCell().appendChild(text_node);
    }
}

document.getElementById("compute-button").addEventListener("click", () => { compute(globals.line1, globals.line2) }, false);

function getSemiMajorAxis(period) {
    const mu = 398600441800000;
    return Math.cbrt(mu * period ** 2 / (4 * Math.PI ** 2));
}

const earthRadius = 6378.135E3; // meters. WGS72 equatorial radius (to be consistent with spacetrack)

function getApogeeHeight(semiMajorAxis, eccentricity) {
    return semiMajorAxis * (1 + eccentricity) - earthRadius;
}

function getPerigeeHeight(semiMajorAxis, eccentricity) {
    return semiMajorAxis * (1 - eccentricity) - earthRadius;
}

function displaySatrecInfo(satrec) {
    // TODO get name from TLE
    // TODO check if milliseconds are accurate
    // TODO get COSPAR from TLE
    const semiMajorAxis = getSemiMajorAxis(getPeriod(satrec.no_kozai));

    const table = document.getElementById("orbit-info-table");
    const tbody = document.createElement("tbody");

    while (table.tBodies.length > 0) {
        table.tBodies[0].remove();
    }

    makeRow(tbody, "Catalog Number", satrec.satnum);

    const epoch = satellite.invjday(satrec.jdsatepoch);
    makeRow(tbody, "Epoch", epoch.toISOString());

    const currentDate = new Date();
    const tleAge = currentDate - epoch; // ms

    const p = document.createElement("p");
    p.textContent = "Computed " + currentDate.toString();
    table.insertAdjacentElement("beforebegin", p);

    makeRow(tbody, "TLE Age", (tleAge / 86400000).toFixed(2) + " days");
    makeRow(tbody, "Mean Motion", (satrec.no_kozai / 2 / Math.PI * 24 * 60).toFixed(8) + " rev/day");
    makeRow(tbody, "Orbital Period", (getPeriod(satrec.no_kozai) / 60).toFixed(2) + " minutes");
    makeRow(tbody, "Semi-Major Axis", (semiMajorAxis / 1000).toFixed(3) + " km");
    makeRow(tbody, "Eccentricity", satrec.ecco.toFixed(7));
    makeRow(tbody, "Apogee Height", (getApogeeHeight(semiMajorAxis, satrec.ecco) / 1000).toFixed(3) + " km");
    makeRow(tbody, "Perigee Height", (getPerigeeHeight(semiMajorAxis, satrec.ecco) / 1000).toFixed(3) + " km");
    makeRow(tbody, "Inclination", satellite.radiansToDegrees(satrec.inclo).toFixed(4) + " degrees");
    makeRow(tbody, "RAAN", satellite.radiansToDegrees(satrec.nodeo).toFixed(4) + " degrees");
    makeRow(tbody, "Arg of Perigee", satellite.radiansToDegrees(satrec.argpo).toFixed(4) + " degrees");
    makeRow(tbody, "Mean Anomaly", satellite.radiansToDegrees(satrec.mo).toFixed(4) + " degrees");
    makeRow(tbody, "B*", satrec.bstar);

    table.appendChild(tbody);
}