<script lang="ts">
    import type { Satellite } from "../passtime/passtime";
    import * as satellite from "satellite.js";
    import HorizontalTable from "./HorizontalTable.svelte";

    export let sat: Satellite;

    let tleAge = 0,
        period = null;

    function getObjects(sat?: Satellite) {
        const objects = [
            { header: "Name", data: [sat?.name ?? ""] },
            { header: "Catalog Number", data: [sat?.satrec.satnum ?? ""] },
            { header: "Epoch", data: [sat?.epochDate.toISOString() ?? ""] },
            { header: "TLE Age", data: [sat ? (tleAge / 86400000).toFixed(2) + " days" : ""] },
            { header: "Eccentricity", data: [sat?.satrec.ecco ?? ""] },
            {
                header: "Inclination",
                data: [satellite.radiansToDegrees(sat?.satrec.inclo) + " degrees" ?? ""],
            },
            {
                header: "RAAN",
                data: [satellite.radiansToDegrees(sat?.satrec.nodeo) + " degrees" ?? ""],
            },
            {
                header: "Arg of Perigee",
                data: [satellite.radiansToDegrees(sat?.satrec.argpo) + " degrees" ?? ""],
            },
            {
                header: "Mean Anomaly",
                data: [satellite.radiansToDegrees(sat?.satrec.mo) + " degrees" ?? ""],
            },
            { header: "B*", data: [sat?.satrec.bstar ?? ""] },
        ];
        return objects;
    }

    $: if (sat) {
        tleAge = Date.now() - sat.epochDate.getTime();
    }
</script>

<HorizontalTable objects={getObjects(sat)} />

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
