
import swisseph from 'swisseph';

function debug() {
    console.log("--- Debugging swisseph swe_houses ---");

    const tjd = 2451545.0;
    const lat = 27.0;
    const lon = 85.0;
    const hsys = 'P'.charCodeAt(0); // swisseph expects char code or string?
    // node-swisseph usually takes 'P' as string or code.

    try {
        console.log("Calling swe_houses with 'P'...");
        const res = swisseph.swe_houses(tjd, lat, lon, 'P');
        console.log("Result keys:", Object.keys(res || {}));
        console.log("ascmc:", res.ascmc);
        console.log("house:", res.house);
    } catch (e) {
        console.log("Error calling swe_houses:", e.message);
    }
}

debug();
