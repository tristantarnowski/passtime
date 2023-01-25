<script lang="ts">
    import type { Pass } from "../passtime/passtime";
    import * as satellite from "satellite.js";

    export let passes: Pass[];
    export let maxSecondsBetween: number = Infinity;

    $: groups = groupPasses(passes, maxSecondsBetween * 1000);

    function groupPasses(passes: Pass[], maxTimeBetween: number): Pass[][] {
        let prevStartTime = new Date(0);
        if (passes.length > 0) {
            prevStartTime = passes[0].start.time;
        }

        let groups = [[]];

        for (const pass of passes) {
            if (pass.start.time.getTime() - prevStartTime.getTime() > maxTimeBetween) {
                groups.push([]);
            }

            groups.at(-1).push(pass);

            prevStartTime = pass.start.time;
        }

        return groups;
    }
</script>

<table>
    <thead>
        <tr>
            <th>Start Time (Local)</th>
            <th>Max Elevation</th>
            <th>Duration (s)</th>
        </tr>
    </thead>
    {#each groups as group}
        <tbody>
            {#each group as pass}
                <tr>
                    <td>{pass.start.time.toLocaleString()}</td>
                    <td class="center"
                        >{satellite.radiansToDegrees(pass.max.altaz.elevation).toFixed(1)}</td
                    >
                    <td class="center"
                        >{((pass.end.time.getTime() - pass.start.time.getTime()) / 1000).toFixed(
                            0
                        )}</td
                    >
                </tr>
            {:else}
                <tr><td colspan="3">No passes found</td></tr>
            {/each}
        </tbody>
    {/each}
</table>

<style>
    tbody:not(:last-child) {
        border-bottom: 0.2rem solid #bbbbbb;
    }

    th,
    td {
        padding: 0.2rem;
    }

    .center {
        text-align: center;
    }

    tbody tr:hover {
        background-color: #d9e6ff;
    }

    select {
        font-size: 0.875rem;
    }
</style>
