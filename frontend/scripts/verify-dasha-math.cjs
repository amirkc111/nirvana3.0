const swisseph = require('swisseph');
const path = require('path');

// Constants
const SE_MOON = 1;
const SEFLG_SIDEREAL = 64 * 1024;
const SEFLG_SWIEPH = 2;
const SE_SIDM_LAHIRI = 1;
const SE_GREG_CAL = 1;

async function verify() {
    console.log("--- Dasha Math Verification Script ---");

    // Set Ephemeris Path
    const ephePath = path.join(process.cwd(), 'public', 'swisseph', 'assets', 'ephe');
    swisseph.swe_set_ephe_path(ephePath);
    console.log("Setting Ephemeris Path:", ephePath);

    // Test Case 1: 01.01.1990 at 01:00:00 UT
    const year = 1990;
    const month = 1;
    const day = 1;
    const hour = 1;
    const minute = 0;
    const second = 0;

    console.log(`Test Case 1: ${day}.${month}.${year} at ${hour}:${minute}:${second} UT`);

    // 1. Convert UTC -> Julian Day (UT)
    const jd_res = swisseph.swe_utc_to_jd(year, month, day, hour, minute, second, SE_GREG_CAL);
    const jd_ut = jd_res.julianDayUT;
    console.log("Julian Day (UT):", jd_ut.toFixed(6));

    // 2. Set Lahiri ayanāṁśa
    swisseph.swe_set_sid_mode(SE_SIDM_LAHIRI, 0, 0);
    const ayanamsa = swisseph.swe_get_ayanamsa_ut(jd_ut);
    console.log("Ayanamsa (Lahiri):", ayanamsa.toFixed(6));

    // 3. Compute Moon longitude
    const flags = SEFLG_SIDEREAL | SEFLG_SWIEPH;
    const moon = swisseph.swe_calc_ut(jd_ut, SE_MOON, flags);

    if (moon.error) {
        console.error("Error calculating Moon position:", moon.error);
        return;
    }

    const moonLongitude = moon.longitude;
    console.log("Moon Sidereal Longitude:", moonLongitude.toFixed(6));

    // Derive Nakshatra (0-26)
    const NAK_SIZE = 13 + 20 / 60;
    const nakIndex = Math.floor(moonLongitude / NAK_SIZE);
    const inNak = moonLongitude - (nakIndex * NAK_SIZE);
    const fracRemaining = 1 - (inNak / NAK_SIZE);

    console.log("Nakshatra Index (0-26):", nakIndex);
    console.log("Position in Nakshatra:", inNak.toFixed(6));
    console.log("Fraction Remaining:", fracRemaining.toFixed(6));
    console.log("---------------------------------------");
}

verify();
