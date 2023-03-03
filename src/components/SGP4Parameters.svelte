<script lang="ts">
    import type { Satellite } from "../passtime/passtime";
    import * as satellite from "satellite.js";

    export let sat: Satellite;

    let epoch;

    $: if (sat) {
        epoch =
            sat.satrec.epochyr.toString() +
            sat.satrec.epochdays.toString().split(".")[0].padStart(3, "0") +
            "." +
            sat.satrec.epochdays.toString().split(".")[1].padEnd(8, "0");
    }

    async function copy() {
        if (Date.now() - sat.epochDate.getTime() > 86400000 * 1.5) {
            alert("Warning: TLE is older than 1.5 days");
        }

        const content = document.getElementById("info").outerHTML;
        const type = "text/html";
        const blob = new Blob([content], { type });
        navigator.clipboard.write([new ClipboardItem({ [type]: blob })]);
    }
</script>

<button on:click={copy}>Copy SGP4 Elements</button>
{#if sat}
    <div id="info">
        <table>
            <tr
                ><td style="color:red; border:1px solid black;">Inclination</td><td
                    style="color:red; border:1px solid black;"
                    >{satellite.radiansToDegrees(sat.satrec.inclo).toFixed(4)}</td
                ></tr
            >
            <tr
                ><td style="color:red; border:1px solid black;">Eccentricity</td><td
                    style="color:red; border:1px solid black;">{sat.satrec.ecco.toFixed(7)}</td
                ></tr
            >
            <tr
                ><td style="color:red; border:1px solid black;">RAAN</td><td
                    style="color:red; border:1px solid black;"
                    >{satellite.radiansToDegrees(sat.satrec.nodeo).toFixed(4)}</td
                ></tr
            >
            <tr
                ><td style="color:red; border:1px solid black;">Argument of Perigee</td><td
                    style="color:red; border:1px solid black;"
                    >{satellite.radiansToDegrees(sat.satrec.argpo).toFixed(4)}</td
                ></tr
            >
            <tr
                ><td style="color:red; border:1px solid black;">B-Star</td><td
                    style="color:red; border:1px solid black;">{sat.satrec.bstar}</td
                ></tr
            >
            <tr
                ><td style="color:red; border:1px solid black;">Mean Motion</td><td
                    style="color:red; border:1px solid black;"
                    >{((sat.satrec.no_kozai / 2 / Math.PI) * 24 * 60).toFixed(8)}</td
                ></tr
            >
            <tr
                ><td style="color:red; border:1px solid black;">Mean Anomaly</td><td
                    style="color:red; border:1px solid black;"
                    >{satellite.radiansToDegrees(sat.satrec.mo).toFixed(4)}</td
                ></tr
            >
            <tr
                ><td style="color:red; border:1px solid black;">Epoch</td><td
                    style="color:red; border:1px solid black;">{epoch}</td
                ></tr
            >
        </table>
    </div>
{/if}

<style>
    div {
        display: none;
    }
</style>
