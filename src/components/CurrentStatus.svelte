<script lang="ts">
    import type { Satellite, Location, Pass } from "../passtime/passtime";
    import { DateTime, Duration } from "luxon";
    import * as satellite from "satellite.js";
    import { onMount } from "svelte";

    export let sat: Satellite, observer: Location, nextPass: Pass;

    export let handleLOS;

    let now, elevation, azimuth, nextEventTime, countdown;
    let nextEvent: String = "LOS";
    

        onMount(() => {
            setInterval(() => {
                now = new Date();
                elevation = sat.altAz(observer, new Date()).elevation;
                azimuth = sat.altAz(observer, new Date()).azimuth;

                if (now < nextPass.start.time) {
                    nextEvent = "AOS";
                    nextEventTime = nextPass.start.time;
                } else if (now < nextPass.end.time) {
                    nextEvent = "LOS";
                    nextEventTime = nextPass.end.time;
                }
                
                if (now > nextPass.end.time) {
                    nextEventTime = now;
                    handleLOS();
                }

                countdown = nextEventTime.getTime() - now.getTime();
            }, 1000);
        });

    
</script>

<table>
    <tbody>
        <tr><th>Time</th><td>{DateTime.fromJSDate(now).toLocaleString(DateTime.TIME_WITH_SECONDS)}</td></tr>
        <tr><th>Elevation</th><td>{sat ? satellite.radiansToDegrees(elevation).toFixed(1) : ""}</td></tr>
        <tr><th>Azimuth</th><td>{sat ? satellite.radiansToDegrees(azimuth).toFixed(1) : ""}</td></tr>
        <tr><th>{nextEvent}</th><td>{sat ? Duration.fromMillis(countdown).toFormat('hh:mm:ss') + " (" + DateTime.fromJSDate(nextEventTime).toLocaleString(DateTime.TIME_WITH_SECONDS) + ")" : ""}</td>
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