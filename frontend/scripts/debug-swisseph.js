
import swisseph from 'swisseph';

function debug() {
    console.log("--- Debugging swisseph (Native) ---");
    console.log("Type of export:", typeof swisseph);

    // Check key functions required by Kundli.ts
    const required = [
        'swe_set_sid_mode', 'swe_set_topo', 'swe_utc_to_jd',
        'swe_houses', 'swe_calc_ut', 'SE_SUN', 'SEFLG_SWIEPH'
    ];

    required.forEach(fn => {
        console.log(`Has ${fn}:`, swisseph[fn] !== undefined);
        if (swisseph[fn]) {
            console.log(`Type of ${fn}:`, typeof swisseph[fn]);
        }
    });

    // Test calculation
    try {
        // swe_julday(year, month, day, hour, gregflag)
        // Note: swisseph usually follows C API: returns value or object
        // Some node-swisseph wrappers are async/callback. Let's check.

        console.log("Trying swe_julday (if exists)...");
        if (swisseph.swe_julday) {
            const jd = swisseph.swe_julday(2000, 1, 1, 12, swisseph.SE_GREG_CAL);
            console.log("swe_julday result:", jd);
        }

    } catch (e) {
        console.error("Test failed:", e);
    }
}

debug();
