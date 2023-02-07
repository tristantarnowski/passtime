<script lang="ts">
    import type { Satellite } from "../passtime/passtime";
    import * as satellite from "satellite.js";

    export let sat: Satellite;

    let tleAge = 0,
        period = null;

    let rows = new Map();
    rows.set("Name", []);
    rows.set("Catalog Number", []);
    rows.set("Epoch", []);
    rows.set("TLE Age", []);
    rows.set("Eccentricity", []);
    rows.set("Inclination", []);
    rows.set("RAAN", []);
    rows.set("Arg of Perigee", []);
    rows.set("Mean Anomaly", []);
    rows.set("B*", []);

    $: if (sat) {
        tleAge = Date.now() - sat.epochDate.getTime();

        rows.set("Name", [sat.name]);
        rows.set("Catalog Number", [sat.satrec.satnum]);
        rows.set("Epoch", [sat.epochDate.toISOString()]);
        rows.set("TLE Age", [(tleAge / 86400000).toFixed(2) + " days"]);
        rows.set("Eccentricity", [sat.satrec.ecco]);
        rows.set("Inclination", [satellite.radiansToDegrees(sat.satrec.inclo) + " degrees"]);
        rows.set("RAAN", [satellite.radiansToDegrees(sat.satrec.nodeo) + " degrees"]);
        rows.set("Arg of Perigee", [satellite.radiansToDegrees(sat.satrec.argpo) + " degrees"]);
        rows.set("Mean Anomaly", [satellite.radiansToDegrees(sat.satrec.mo) + " degrees"]);
        rows.set("B*", [sat.satrec.bstar]);
        rows = rows;
    }
</script>

<table>
    <tbody>
        {#each [...rows] as [key, value]}
            <tr>
                <th>{key}</th>
                {#each value as data}
                    <td>{data}</td>
                {/each}
            </tr>
        {/each}
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
