<script lang="ts">
    import type { Satellite } from "../passtime/passtime";
    import * as satellite from "satellite.js";

    export let sat: Satellite;

    let tleAge = 0,
        period = null;

    $: if (sat) {
        tleAge = Date.now() - sat.epochDate.getTime();
    }
</script>

<table>
    <tbody>
        <tr><th>Name</th><td>{sat ? sat.name : ""}</td></tr>
        <tr><th>Catalog Number</th><td>{sat ? sat.satrec.satnum : ""}</td></tr>
        <tr><th>Epoch</th><td>{sat ? sat.epochDate.toISOString() : ""}</td></tr>
        <tr><th>TLE Age</th><td>{sat ? (tleAge / 86400000).toFixed(2) + " days" : ""}</td></tr>
        <!-- <tr><th>Mean Motion</th><td>{sat.satrec.no}</td></tr> -->
        <!-- <tr><th>Orbital Period</th><td>{period}</td></tr> -->
        <!-- <tr><th>Semi-Major Axis</th><td>{sat.satrec.a}</td></tr> -->
        <tr><th>Eccentricity</th><td>{sat ? sat.satrec.ecco : ""}</td></tr>
        <!-- <tr><th>Apogee Height</th><td>{sat.satrec.a}</td></tr> -->
        <!-- <tr><th>Perigee Height</th><td>{sat.satrec.satnum}</td></tr> -->
        <tr>
            <th>Inclination</th>
            <td>{sat ? satellite.radiansToDegrees(sat.satrec.inclo) + " degrees" : ""}</td>
        </tr>
        <tr
            ><th>RAAN</th><td
                >{sat ? satellite.radiansToDegrees(sat.satrec.nodeo) + " degrees" : ""}</td
            ></tr
        >
        <tr>
            <th>Arg of Perigee</th>
            <td>{sat ? satellite.radiansToDegrees(sat.satrec.argpo) + " degrees" : ""}</td>
        </tr>
        <tr>
            <th>Mean Anomaly</th>
            <td>{sat ? satellite.radiansToDegrees(sat.satrec.mo) + " degrees" : ""}</td>
        </tr>
        <tr><th>B*</th><td>{sat ? sat.satrec.bstar : ""}</td></tr>
    </tbody>
</table>

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
