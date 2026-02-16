
import swisseph from 'swisseph';
import path from 'path';

function debug() {
    console.log("--- Debugging swisseph calc_ut with Path ---");

    // Set Ephemeris Path
    const ephePath = path.join(process.cwd(), 'public', 'swisseph', 'assets', 'ephe');
    console.log("Path:", ephePath);
    swisseph.swe_set_ephe_path(ephePath);

    const tjd = 2451545.0; // 2000-01-01
    const planet = swisseph.SE_SUN;
    // Test with AND without SWIEPH flag
    const flag = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED | swisseph.SEFLG_SIDEREAL;

    try {
        console.log("Calc with SEFLG_SWIEPH...");
        const res = swisseph.swe_calc_ut(tjd, planet, flag);
        console.log("Result:", res);

        // Check for error in result
        if (res.error) console.log("Internal Error Msg:", res.error);

    } catch (e) {
        console.log("Error:", e.message);
    }
}

debug();
