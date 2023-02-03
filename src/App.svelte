<script lang="ts">
    import {
        type Pass,
        type Location,
        Satellite,
        TLE,
        fetchCelestrakTle,
    } from "./passtime/passtime";
    import PassTable from "./components/PassTable.svelte";
    import InfoTable from "./components/InfoTable.svelte";
    import Footer from "./components/Footer.svelte";
    import { onMount } from "svelte";
    import { degreesLong } from "satellite.js";

    let passes: Pass[] = [],
        tleString = "";

    const url = new URL(window.location.href);

    let catalogNumber = catalogNumberFromString(url.searchParams.get("id"));

    let sat: Satellite = null;

    let observer: Location = {
        latitude: 48.4612,
        longitude: -123.31,
    };

    function catalogNumberFromString(string: string): number {
        const number = parseInt(string, 10);

        if (0 <= number && number <= 99999) {
            return number;
        } else {
            return null;
        }
    }

    function numDaysFromString(string: string): number {
        const number = parseInt(string, 10);

        if (number > 0) {
            return number;
        } else {
            return null;
        }
    }

    let numDays = numDaysFromString(url.searchParams.get("days")) || 3,
        minElev = 15;

    async function handleClickTleButton() {
        tleString = (await fetchCelestrakTle(catalogNumber)).trim();
    }

    function handleCompute() {
        compute(new TLE(tleString));
    }

    function compute(tle: TLE) {
        const start = new Date(),
            end = new Date(start.getTime() + numDays * 86400000);

        sat = null;
        passes = [];
        sat = new Satellite(tle);
        passes = sat.getPasses(observer, start, end, minElev);
    }

    function handleTextAreaBlur() {
        this.scrollTop = 0;
    }

    async function handleTleSubmit() {
        tleString = (await fetchCelestrakTle(catalogNumber)).trim();
        blurAllInputs();
    }

    function blurAllInputs() {
        for (const input of document.querySelectorAll("input")) {
            input.blur();
        }
    }

    onMount(() => {
        if (catalogNumber) {
            handleTleSubmit().then(() => {
                handleCompute();
            });
        }
    });
</script>

<main>
    <section>
        <div class="flex-container">
            <div>
                <h3>Location</h3>
                <form>
                    <label>Latitude</label>
                    <input bind:value={observer.latitude} />
                    <label>Longitude</label>
                    <input bind:value={observer.longitude} />
                </form>
            </div>
            <div>
                <h3>TLE</h3>
                <form
                    id="tle-form"
                    style="grid-template-columns: max-content max-content max-content;"
                    on:submit|preventDefault={handleTleSubmit}
                >
                    <label>Fetch by Catalog ID</label>
                    <input
                        type="number"
                        min="0"
                        max="99999"
                        bind:value={catalogNumber}
                    />
                    <button on:click={handleClickTleButton} type="submit"
                        >Get TLE</button
                    >
                </form>
                <textarea
                    rows="3"
                    cols="69"
                    spellcheck="false"
                    placeholder="Paste TLE here, or fetch from Celestrak"
                    bind:value={tleString}
                    on:blur={handleTextAreaBlur}
                />
            </div>
            <div>
                <h3>Options</h3>
                <form>
                    <label>Number of Days</label>
                    <input type="number" min="0" bind:value={numDays} />

                    <label>Minimum Elevation</label>
                    <input type="number" min="0" bind:value={minElev} />
                </form>
            </div>
        </div>
        <button class="full-width space-top highlight" on:click={handleCompute}
            >Compute</button
        >
    </section>
    <section>
        <h2>TLE Information</h2>
        <InfoTable {sat} />
    </section>
    <section>
        <h2>Upcoming Passes</h2>
        <PassTable {passes} maxSecondsBetween={7000} />
    </section>
</main>
<Footer />

<style>
    form {
        display: grid;
        grid-template-columns: max-content max-content;
        column-gap: 0.5rem;
    }

    .full-width {
        width: 100%;
    }

    .space-top {
        margin-top: 1rem;
    }

    .highlight {
        padding: 0.25rem;
        background-color: #8aa3d0;
        color: white;
    }

    .flex-container {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
    }

    h3 {
        margin-bottom: 0.5rem;
    }
</style>
