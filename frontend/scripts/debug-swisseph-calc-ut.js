
import swisseph from 'swisseph';

function debug() {
    console.log("--- Debugging swisseph calc_ut ---");

    // TJD for 2000-01-01
    const tjd = 2451545.0;
    const planet = swisseph.SE_SUN;
    const flag = swisseph.SEFLG_SWIEPH;

    // Attempt 1: Call as synchronous (checking return value)
    try {
        const ret = swisseph.swe_calc_ut(tjd, planet, flag);
        console.log("Sync Call Return:", ret);
        if (ret && (ret.longitude !== undefined || Array.isArray(ret))) {
            console.log("Seems Synchronous!");
        } else {
            console.log("Return value not data. Likely expecting callback.");
        }
    } catch (e) {
        console.log("Sync call threw error:", e.message);
    }

    // Attempt 2: Call with callback
    try {
        swisseph.swe_calc_ut(tjd, planet, flag, (res) => {
            console.log("Callback Result:", res);
        });
    } catch (e) {
        console.log("Callback call threw error:", e.message);
    }
}

debug();
