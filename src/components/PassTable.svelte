<script lang="ts">
    import type { Pass } from "../passtime/passtime";
    import * as satellite from "satellite.js";
    import { DateTime } from "luxon";

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

    enum Format {
        short12,
        short24,
        iso,
        default,
    }

    function formatDate(date: Date, format: Format, utc?: boolean): string {
        let dateTime = DateTime.fromJSDate(date),
            string = "";

        if (utc) {
            dateTime = dateTime.toUTC();
        }

        switch (format) {
            case Format.short12:
                string = dateTime.toFormat("ccc LLL d tt");
                break;

            case Format.short24:
                string = dateTime.toFormat("ccc LLL d TT");
                break;

            case Format.iso:
                string = dateTime.toISO();
                break;

            case Format.default:
                if (utc) {
                    string = date.toUTCString();
                } else {
                    string = date.toLocaleString();
                }
                break;
        }

        return string;
    }

    function getLocaleTimezoneAbbreviation() {
        return DateTime.local().toFormat("ZZZZ");
    }

    const formats = [
        { text: "Short 12-hour", format: Format.short12 },
        { text: "Short 24-hour", format: Format.short24 },
        { text: "ISO 8601", format: Format.iso },
        { text: "Browser Default", format: Format.default },
    ];

    const timezones = [
        { text: "Local", utc: false },
        { text: "UTC", utc: true },
    ];

    let selectedFormat = JSON.parse(localStorage.getItem("selectedFormat")) || Format.short12;
    let isUTC = JSON.parse(localStorage.getItem("isUTC")) || false;

    const d = DateTime.fromJSDate(new Date());
    console.log(d.toISO());
</script>

<label>Timezone</label>
<select
    bind:value={isUTC}
    on:change={() => {
        localStorage.setItem("isUTC", JSON.stringify(isUTC));
    }}
>
    {#each timezones as timezone}
        <option value={timezone.utc}>
            {timezone.text}
        </option>
    {/each}
</select>
<label>Format</label>
<select
    bind:value={selectedFormat}
    on:change={() => {
        localStorage.setItem("selectedFormat", JSON.stringify(selectedFormat));
    }}
>
    {#each formats as format}
        <option value={format.format}>
            {format.text}
        </option>
    {/each}
</select>

<table>
    <thead>
        <tr>
            <th>Start Time ({isUTC ? "UTC" : getLocaleTimezoneAbbreviation()})</th>
            <th>Max Elevation (°)</th>
            <th>Duration (s)</th>
        </tr>
    </thead>
    {#each groups as group}
        <tbody>
            {#each group as pass}
                <tr>
                    <td>{formatDate(pass.start.time, selectedFormat, isUTC)}</td>
                    <td class="center">
                        {satellite.radiansToDegrees(pass.max.altaz.elevation).toFixed(1)}
                    </td>
                    <td class="center">
                        {((pass.end.time.getTime() - pass.start.time.getTime()) / 1000).toFixed(0)}
                    </td>
                </tr>
            {:else}
                <tr>
                    <td colspan="3">No passes found</td>
                </tr>
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
        background-color: #e7e7e7;
    }
</style>
