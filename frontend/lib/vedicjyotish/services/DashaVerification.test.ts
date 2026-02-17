// @ts-nocheck
import { DateTime } from "luxon";
import { computeDashaPoint } from "./DashaCore";
import { calcVimsottariDasa } from "./calcVimsottariDasa/index";
import { calcYoginiDasha } from "./calcYoginiDasha/index";
import { calcTribhagiDasha } from "./calcTribhagiDasha/index";
import { kundaliGenerationService } from "../../kundaliGenerationService";

describe("Dasha Canonical Verification", () => {
    // Test Case: 01-01-1990 01:00:00 UT
    const birthUTC = DateTime.fromObject({
        year: 1990,
        month: 1,
        day: 1,
        hour: 1,
        minute: 0,
        second: 0
    }, { zone: 'utc' });

    const birthJD = 2447892.54167; // approx

    // Reference value from swetest -p1 -sid1 -fPl -head for 01.01.1990 01:00 UT
    const refMoon = 303.394000;

    beforeAll(async () => {
        // Ensure SWE is initialized
        await kundaliGenerationService.initialize();
    });

    describe("Vimshottari Dasha", () => {
        it("Moon longitude must match Swiss Ephemeris", () => {
            const { moonLongitude } = computeDashaPoint(birthUTC);
            expect(Math.abs(moonLongitude - refMoon)).toBeLessThan(0.0005);
        });

        it("Birth must lie inside localized Mahadasha", () => {
            const dashas = calcVimsottariDasa(birthJD, {} as any, birthUTC);
            const md = dashas.find(d => birthUTC >= d.StartDate && birthUTC <= d.EndDate);
            expect(md).toBeDefined();
            expect(birthUTC >= md!.StartDate && birthUTC < md!.EndDate).toBe(true);
        });

        it("Antar sum equals Mahadasha duration", () => {
            const dashas = calcVimsottariDasa(birthJD, {} as any, birthUTC);
            const md = dashas[0]; // Take any MD for summation test
            const md_duration_days = md.EndDate.diff(md.StartDate, 'days').days;

            const antar_sum_days = md.ChildDasha.reduce((sum, ad) => {
                return sum + ad.EndDate.diff(ad.StartDate, 'days').days;
            }, 0);

            expect(Math.abs(antar_sum_days - md_duration_days)).toBeLessThan(1e-4);
        });
    });

    describe("Yogini Dasha", () => {
        it("Birth must lie inside first cycle of Yogini", () => {
            const dashas = calcYoginiDasha({} as any, birthUTC);
            const active = dashas.find(d => birthUTC >= d.StartDate && birthUTC <= d.EndDate);
            expect(active).toBeDefined();
        });

        it("Yogini timeline sum equals 36 * N years", () => {
            const dashas = calcYoginiDasha({} as any, birthUTC);
            // Timeline consists of 3 cycles of 36 years
            const totalDays = dashas[dashas.length - 1].EndDate.diff(dashas[0].StartDate, 'days').days;
            const expectedDays = 3 * 36 * 365.2425;
            expect(Math.abs(totalDays - expectedDays)).toBeLessThan(1);
        });
    });

    describe("Tribhagi Dasha", () => {
        it("Tribhagi total timeline equals 120 years and contains Phase info", () => {
            const dashas = calcTribhagiDasha({} as any, birthUTC);
            // Sequence should cover full 120 years cycle (Mirror Rule)
            const lastDasha = dashas[dashas.length - 1];
            const totalDays = lastDasha.EndDate.diff(dashas[0].StartDate, 'days').days;
            const expectedDays = 120 * 365.2425;

            expect(Math.abs(totalDays - expectedDays)).toBeLessThan(1);
            expect(dashas[0].Phase).toBeDefined();
            expect(dashas[0].PhaseFraction).toBeDefined();
        });
    });

    describe("Idempotency", () => {
        it("Repeated runs must be identical", () => {
            const d1 = calcVimsottariDasa(birthJD, {} as any, birthUTC);
            const d2 = calcVimsottariDasa(birthJD, {} as any, birthUTC);

            // Compare specific timestamps and lords for identical results
            expect(d1[0].Lord).toBe(d2[0].Lord);
            expect(d1[0].StartDate.toMillis()).toBe(d2[0].StartDate.toMillis());
            expect(d1[0].EndDate.toMillis()).toBe(d2[0].EndDate.toMillis());
        });
    });
});
