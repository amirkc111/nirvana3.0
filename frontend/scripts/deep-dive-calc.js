
import swisseph from 'swisseph';
import { DateTime } from 'luxon';
import path from 'path';

// Manual Swiss Ephemeris Interaction for Explainer
const EPHE_PATH = path.join(process.cwd(), 'public/swisseph/assets/ephe');
swisseph.swe_set_ephe_path(EPHE_PATH);

function runCalculation(year, month, day, hour, minute, lat, lon, ayanamsaMode = 1) { // 1 = Lahiri
    console.log(`\n--- CALCULATION: ${year}-${month}-${day} ${hour}:${minute} | Ayanamsa Mode: ${ayanamsaMode} ---`);

    // 1. Time Conversion (IST to UTC)
    // Delhi is UTC+5:30. 
    // 12:00 IST = 06:30 UTC
    // We construct the time strictly.
    const dt = DateTime.fromObject({ year, month, day, hour, minute }, { zone: 'UTC+05:30' });
    const utc = dt.toUTC();
    console.log(`Input IST: ${dt.toISO()}`);
    console.log(`Converted UTC: ${utc.toISO()}`);

    // 2. Julian Day (ET/UT)
    // Using swe_julday directly or via utc_to_jd
    const julday_ut = swisseph.swe_julday(utc.year, utc.month, utc.day, utc.hour + utc.minute / 60 + utc.second / 3600, swisseph.SE_GREG_CAL);
    console.log(`Julian Day (UT): ${julday_ut}`);

    // 3. Ayanamsa
    swisseph.swe_set_sid_mode(ayanamsaMode, 0, 0);
    const ayanamsa = swisseph.swe_get_ayanamsa_ut(julday_ut);
    console.log(`Ayanamsa Value: ${ayanamsa} (${dms(ayanamsa)})`);

    // 4. Ascendant
    // Calculate Tropical Ascendant first
    const houses = swisseph.swe_houses(julday_ut, lat, lon, 'P');
    console.log("Houses Result:", houses); // Debugging
    const tropicalAsc = houses.ascendant;
    let siderealAsc = tropicalAsc - ayanamsa;
    if (siderealAsc < 0) siderealAsc += 360;

    console.log(`Tropical Ascendant: ${tropicalAsc} (${dms(tropicalAsc)})`);
    console.log(`Sidereal Ascendant: ${siderealAsc} (${dms(siderealAsc)})`);

    // 5. Planets (Sun & Moon)
    // Calc Tropical first then subtract (Standard method for proper manual control, or rely on swe_calc with SEFLG_SIDEREAL)
    // To match our Kundli.ts, we rely on swe_calc_ut with SEFLG_SIDEREAL, but let's verify if that matches (Tropical - Ayanamsa).

    const flags = swisseph.SEFLG_SPEED | swisseph.SEFLG_SWIEPH; // Tropical

    // Sun
    const sunTrop = swisseph.swe_calc_ut(julday_ut, swisseph.SE_SUN, flags);
    let sunSid = sunTrop.longitude - ayanamsa;
    if (sunSid < 0) sunSid += 360;
    console.log(`Sun Tropical: ${sunTrop.longitude}`);
    console.log(`Sun Sidereal: ${sunSid} (${dms(sunSid)})`);

    // Moon
    const moonTrop = swisseph.swe_calc_ut(julday_ut, swisseph.SE_MOON, flags);
    let moonSid = moonTrop.longitude - ayanamsa;
    if (moonSid < 0) moonSid += 360;
    console.log(`Moon Tropical: ${moonTrop.longitude}`);
    console.log(`Moon Sidereal: ${moonSid} (${dms(moonSid)})`);

    // 6. Nakshatra Calculation (Moon)
    const nakshatraSpan = 13 + (20 / 60); // 13.3333 degrees
    const moonNakRaw = moonSid / nakshatraSpan;
    const nakIndex = Math.floor(moonNakRaw);
    const nakRemainder = moonSid - (nakIndex * nakshatraSpan);
    const nakPercent = nakRemainder / nakshatraSpan;
    const pada = Math.floor(nakPercent * 4) + 1;

    console.log(`Moon Nakshatra Index: ${nakIndex} (0-26)`);
    console.log(`Moon Nakshatra Remainder: ${nakRemainder.toFixed(4)} degrees`);
    console.log(`Moon Pada: ${pada}`);
}

function dms(deg) {
    const d = Math.floor(deg);
    const m = Math.floor((deg - d) * 60);
    const s = ((deg - d - m / 60) * 3600).toFixed(2);
    return `${d}° ${m}' ${s}"`;
}

console.log("=== DEEP DIVE CALCULATION ===");
// 1. Original: 12:00, Lahiri (1)
runCalculation(1990, 1, 1, 12, 0, 28.7041, 77.1025, 1);

// 2. Time Shift: 12:02, Lahiri (1)
runCalculation(1990, 1, 1, 12, 2, 28.7041, 77.1025, 1);

// 3. Ayanamsa Shift: 12:00, KP (5 = SE_SIDM_KP)
runCalculation(1990, 1, 1, 12, 0, 28.7041, 77.1025, 5);
