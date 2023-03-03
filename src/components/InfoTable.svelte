<script lang="ts">
    import type { Satellite } from "../passtime/passtime";
    import * as satellite from "satellite.js";
    import Sgp4Parameters from "./SGP4Parameters.svelte";

    export let sat: Satellite;

    const earthRadius = 6378.135e3; // meters. WGS72 equatorial radius

    let tleAge, meanMotion, period;

    $: if (sat) {
        tleAge = Date.now() - sat.epochDate.getTime();

        meanMotion = (sat.satrec.no_kozai / 2 / Math.PI) * 24 * 60; // rev/day
        period = 86400 / meanMotion; // seconds
    }
</script>

<table>
    <tbody>
        <tr><th>Name</th><td>{sat ? sat.name : ""}</td></tr>
        <tr><th>Catalog Number</th><td>{sat ? sat.satrec.satnum : ""}</td></tr>
        <tr><th>Epoch</th><td>{sat ? sat.epochDate.toISOString() : ""}</td></tr>
        <tr><th>TLE Age</th><td>{sat ? (tleAge / 86400000).toFixed(2) + " days" : ""}</td></tr>
        <tr><th>Mean Motion</th><td>{sat ? meanMotion.toFixed(8) + " rev/day" : ""}</td></tr>
        <tr><th>Orbital Period</th><td>{sat ? (period / 60).toFixed(2) + " minutes" : ""}</td></tr>
        <tr
            ><th>Semi-Major Axis</th><td
                >{sat ? ((sat.satrec.a * earthRadius) / 1000).toFixed(3) + " km" : ""}</td
            ></tr
        >
        <tr><th>Eccentricity</th><td>{sat ? sat.satrec.ecco.toFixed(7) : ""}</td></tr>
        <tr
            ><th>Apogee Height</th><td
                >{sat ? ((sat.satrec.alta * earthRadius) / 1000).toFixed(3) + " km" : ""}</td
            ></tr
        >
        <tr
            ><th>Perigee Height</th><td
                >{sat ? ((sat.satrec.altp * earthRadius) / 1000).toFixed(3) + " km" : ""}</td
            ></tr
        >
        <tr>
            <th>Inclination</th>
            <td
                >{sat
                    ? satellite.radiansToDegrees(sat.satrec.inclo).toFixed(4) + " degrees"
                    : ""}</td
            >
        </tr>
        <tr
            ><th>RAAN</th><td
                >{sat
                    ? satellite.radiansToDegrees(sat.satrec.nodeo).toFixed(4) + " degrees"
                    : ""}</td
            ></tr
        >
        <tr>
            <th>Arg of Perigee</th>
            <td
                >{sat
                    ? satellite.radiansToDegrees(sat.satrec.argpo).toFixed(4) + " degrees"
                    : ""}</td
            >
        </tr>
        <tr>
            <th>Mean Anomaly</th>
            <td>{sat ? satellite.radiansToDegrees(sat.satrec.mo).toFixed(4) + " degrees" : ""}</td>
        </tr>
        <tr><th>B*</th><td>{sat ? sat.satrec.bstar : ""}</td></tr>
    </tbody>
</table>
<Sgp4Parameters {sat} />

<style>
    tbody,
    th,
    td {
        border: none;
    }

    th {
        text-align: start;
    }

    td {
        padding-left: 1rem;
    }
</style>
