import * as satellite from "satellite.js";
import { findMaxima, findX } from "./search";

export type Degrees = number;
export type Meters = number;

export class TLE {
    name: string = "";
    line1: string = "";
    line2: string = "";

    constructor(tleString: string) {
        let lines = tleString.trim().split(/\r?\n/);

        if (lines.length > 2) {
            this.name = lines[0].trim();
            lines.shift();
        }

        this.line1 = lines[0];
        this.line2 = lines[1];
    }
}

export interface Event {
    time: Date,
    altaz: satellite.LookAngles
}

export interface Pass {
    start: Event,
    max: Event,
    end: Event
}

export interface Location {
    latitude: Degrees,
    longitude: Degrees,
    elevation?: Meters
}

export class Satellite {
    satrec: satellite.SatRec;
    name: string;
    epochDate: Date;

    constructor(tle: TLE) {
        this.name = tle.name;
        this.satrec = satellite.twoline2satrec(tle.line1, tle.line2);
        this.epochDate = satellite.invjday(this.satrec.jdsatepoch);
    }

    altAz(observer: Location, date: Date): satellite.LookAngles {
        const gmst = satellite.gstime(date),
            eci = satellite.propagate(this.satrec, date),
            ecf = satellite.eciToEcf(eci.position as satellite.EciVec3<satellite.Kilometer>, gmst);

        const geoLoc: satellite.GeodeticLocation = {
            latitude: satellite.degreesToRadians(observer.latitude),
            longitude: satellite.degreesToRadians(observer.longitude),
            height: observer.elevation || 0
        }

        return satellite.ecfToLookAngles(geoLoc, ecf);
    }

    getPasses(observer: Location, start: Date, end: Date, minElev: satellite.Degrees): Pass[] {
        let passes: Pass[] = [];

        const f = (t: number): satellite.Radians => {
            return this.altAz(observer, new Date(t)).elevation;
        }

        let maxima = findMaxima(f, start.getTime(), end.getTime());

        maxima = maxima.filter(max => max[1] > satellite.degreesToRadians(minElev));

        for (const max of maxima) {
            const maxPassLength = 400000;

            const startTime = findX(f, max[0] - maxPassLength / 2, max[0], satellite.degreesToRadians(minElev)).at(-1);
            const endTime = findX(f, max[0], max[0] + maxPassLength / 2, satellite.degreesToRadians(minElev)).at(0);

            const start: Event = {
                time: new Date(startTime),
                altaz: this.altAz(observer, new Date(startTime))
            }

            const end: Event = {
                time: new Date(endTime),
                altaz: this.altAz(observer, new Date(endTime))
            }

            const maxE: Event = {
                time: new Date(max[0]),
                altaz: this.altAz(observer, new Date(max[0]))
            }

            const pass: Pass = {
                start: start,
                end: end,
                max: maxE
            }

            passes.push(pass);
        }

        return passes;
    }
}


export function fetchCelestrakTle(catalogNumber: number): Promise<string> {
    const url = "https://celestrak.org/NORAD/elements/gp.php?CATNR=" + catalogNumber;

    const req = new XMLHttpRequest();

    return new Promise((resolve) => {
        req.onload = () => {
            resolve(req.responseText);
        }

        req.open("GET", url);
        req.send();
    });


}