
import swisseph from 'swisseph';

function debug() {
    console.log("--- Debugging swisseph utc_to_jd ---");

    // 2000-01-01 12:00:00
    try {
        const res = swisseph.swe_utc_to_jd(2000, 1, 1, 12, 0, 0, swisseph.SE_GREG_CAL);
        console.log("Result:", res);
        console.log("Is Array?", Array.isArray(res));
    } catch (e) {
        console.log("Error:", e.message);
    }
}

debug();
