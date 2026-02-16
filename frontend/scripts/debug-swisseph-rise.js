
import swisseph from 'swisseph';
import path from 'path';

function debug() {
    console.log("--- Debugging swisseph rise_trans ---");

    // Set Path
    const ephePath = path.join(process.cwd(), 'public', 'swisseph', 'assets', 'ephe');
    swisseph.swe_set_ephe_path(ephePath);

    const tjd = 2451545.0;
    const body = swisseph.SE_SUN;
    const lon = 85.0;
    const lat = 27.0;
    const fl = swisseph.SE_CALC_RISE | swisseph.SE_BIT_DISC_CENTER;

    try {
        const res = swisseph.swe_rise_trans(tjd, body, '', fl, lon, lat, 0, 0); // starname empty
        console.log("Result keys:", Object.keys(res || {}));
        console.log("Result:", res);
    } catch (e) {
        console.log("Error:", e.message);
    }
}

debug();
