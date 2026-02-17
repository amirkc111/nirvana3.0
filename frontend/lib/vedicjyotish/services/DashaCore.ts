import { DateTime } from "luxon";
import { MOD360 } from "./utils";

/**
 * Constants for Swiss Ephemeris
 * These are usually available on the global 'swe' object, but defined here for clarity and TS safety.
 */
const SE_MOON = 1;
const SEFLG_SIDEREAL = 64 * 1024;
const SEFLG_SWIEPH = 2;
const SE_SIDM_LAHIRI = 1;
const SE_GREG_CAL = 1;

export const NAK_SIZE = 13 + 20 / 60; // 13.333333333333°
export const SOLAR_YEAR = 365.2422; // Canonical value for Dasha math

export interface DashaPoint {
    moonLongitude: number;
    nakIndex: number;
    inNak: number;
    fracRemaining: number;
}

/**
 * Computes the precise Moon longitude and Nakshatra fraction using Swiss Ephemeris.
 * This is the single source of truth for all Dasha calculations.
 */
export function computeDashaPoint(birthUTC: DateTime): DashaPoint {
    // Note: 'swe' is assumed to be globally available (attached to window/global during init)
    // @ts-ignore
    const sweLib = typeof window !== 'undefined' ? window.swe : global.swe;

    if (!sweLib || typeof sweLib.swe_utc_to_jd !== 'function') {
        throw new Error("Swiss Ephemeris (swe) not initialized. Ensure KundaliGenerationService.initialize() has been called.");
    }

    // 1. Convert UTC -> Julian Day (UT)
    const jd_res = sweLib.swe_utc_to_jd(
        birthUTC.year,
        birthUTC.month,
        birthUTC.day,
        birthUTC.hour,
        birthUTC.minute,
        birthUTC.second,
        SE_GREG_CAL
    );
    const jd_ut = Array.isArray(jd_res) ? jd_res[1] : (jd_res.julianDayUT || jd_res.jd); // Handle array or object

    if (jd_ut === undefined || jd_ut === null || isNaN(jd_ut)) {
        throw new Error("DashaCore: Failed to calculate Julian Day (UT). Result: " + JSON.stringify(jd_res));
    }

    // 2. Set Lahiri ayanāmśa
    sweLib.swe_set_sid_mode(SE_SIDM_LAHIRI, 0, 0);

    // 3. Compute Moon longitude
    const flags = SEFLG_SIDEREAL | SEFLG_SWIEPH;
    const moon = sweLib.swe_calc_ut(jd_ut, SE_MOON, flags);

    // Handle both native object return and array return (from wrapper or WASM)
    const moonLongitude = Array.isArray(moon) ? MOD360(moon[0]) : MOD360(moon.longitude || moon[0]);

    // 4. Derive Nakṣatra & Fraction (0-26)
    const nakIndex = Math.floor(moonLongitude / NAK_SIZE);
    const inNak = moonLongitude - (nakIndex * NAK_SIZE);
    const fracCompleted = inNak / NAK_SIZE;
    const fracRemaining = 1 - fracCompleted;

    return {
        moonLongitude,
        nakIndex,
        inNak,
        fracRemaining
    };
}
