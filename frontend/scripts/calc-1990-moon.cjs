const { DateTime } = require('luxon');
const swisseph = require('swisseph');
const path = require('path');

const ephePath = path.join(__dirname, '../public/swisseph/assets/ephe');
swisseph.swe_set_ephe_path(ephePath);
swisseph.swe_set_sid_mode(1, 0, 0); // Lahiri

const birth = { year: 1990, month: 1, day: 1, hour: 1, minute: 0, second: 0 };
swisseph.swe_utc_to_jd(birth.year, birth.month, birth.day, birth.hour, birth.minute, birth.second, 1, (res) => {
    const jd_ut = res.julianDayUT;
    swisseph.swe_calc_ut(jd_ut, 1, 64 * 1024 + 2, (moon) => {
        const lon = moon.longitude;
        const NAK_SIZE = 13 + 20 / 60;
        const nakIndex = Math.floor(lon / NAK_SIZE);
        const inNak = lon % NAK_SIZE;
        const frac = inNak / NAK_SIZE;

        console.log(`Moon Longitude: ${lon.toFixed(4)}`);
        console.log(`Nakshatra Index: ${nakIndex}`);
        console.log(`Fraction Completed: ${frac.toFixed(4)}`);
        console.log(`Fraction Remaining: ${(1 - frac).toFixed(4)}`);
    });
});
