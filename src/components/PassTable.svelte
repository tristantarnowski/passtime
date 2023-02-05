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
            if (
                pass.start.time.getTime() - prevStartTime.getTime() >
                maxTimeBetween
            ) {
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
        let options: Intl.DateTimeFormatOptions = {
            weekday: "long",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            timeZone: utc ? "UTC" : undefined,
        };

        switch (format) {
            case Format.short12:
                options.hour12 = true;
                return new Intl.DateTimeFormat("en", options).format(date);

            case Format.short24:
                options.hour12 = false;
                return new Intl.DateTimeFormat("en", options).format(date);

            case Format.iso:
                isUTC = true;
                return date.toISOString();

            case Format.default:
                if (utc) {
                    return date.toUTCString();
                } else {
                    return date.toLocaleString();
                }
        }
    }

    function getLocaleTimezoneAbbreviation() {
        const tz = new Intl.DateTimeFormat("en-us", { timeZoneName: "short" })
            .formatToParts(new Date())
            .find((part) => part.type == "timeZoneName").value;

        return tz;
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

    let selectedFormat;
    let isUTC;
</script>

<select bind:value={isUTC}>
    {#each timezones as timezone}
        <option value={timezone.utc}>
            {timezone.text}
        </option>
    {/each}
</select>
<select bind:value={selectedFormat}>
    {#each formats as format}
        <option value={format.format}>
            {format.text}
        </option>
    {/each}
</select>

<table>
    <thead>
        <tr>
            <th
                >Start Time ({isUTC
                    ? "UTC"
                    : getLocaleTimezoneAbbreviation()})</th
            >
            <th>Max Elevation (°)</th>
            <th>Duration (s)</th>
        </tr>
    </thead>
    {#each groups as group}
        <tbody>
            {#each group as pass}
                <tr>
                    <td>{formatDate(pass.start.time, selectedFormat, isUTC)}</td
                    >
                    <td class="center"
                        >{satellite
                            .radiansToDegrees(pass.max.altaz.elevation)
                            .toFixed(1)}</td
                    >
                    <td class="center"
                        >{(
                            (pass.end.time.getTime() -
                                pass.start.time.getTime()) /
                            1000
                        ).toFixed(0)}</td
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
        background-color: #e7e7e7;
    }
</style>
