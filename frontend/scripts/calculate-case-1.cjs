const swisseph = require('swisseph');
const path = require('path');
const { DateTime } = require('luxon');

// Utils
const MOD360 = (x) => {
    let y = x % 360;
    if (y < 0) y += 360;
    return y;
};

// Constants
const SE_MOON = 1;
const SEFLG_SIDEREAL = 64 * 1024;
const SEFLG_SWIEPH = 2;
const SE_SIDM_LAHIRI = 1;
const SE_GREG_CAL = 1;
const NAK_SIZE = 13 + 20 / 60;
const SOLAR_YEAR = 365.2425;

const DurationOfVimsottariDasa = {
    Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
    Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17
};

const VIMS_ORDER = [
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"
];

async function calculateExpected() {
    const ephePath = path.join(process.cwd(), 'public', 'swisseph', 'assets', 'ephe');
    swisseph.swe_set_ephe_path(ephePath);

    // Birth data
    const birthTime = DateTime.fromObject({
        year: 1990, month: 1, day: 1, hour: 6, minute: 30
    }, { zone: 'UTC+5:30' });
    const birthUTC = birthTime.toUTC();

    // 1. Julian Day
    const jd_res = swisseph.swe_utc_to_jd(
        birthUTC.year, birthUTC.month, birthUTC.day,
        birthUTC.hour, birthUTC.minute, birthUTC.second,
        SE_GREG_CAL
    );
    const jd_ut = jd_res.julianDayUT;

    // 2. Sidereal Mode
    swisseph.swe_set_sid_mode(SE_SIDM_LAHIRI, 0, 0);

    // 3. Moon position
    const moon = swisseph.swe_calc_ut(jd_ut, SE_MOON, SEFLG_SIDEREAL | SEFLG_SWIEPH);
    const lon = MOD360(moon.longitude);

    // 4. Nakshatra math
    const nakIndex = Math.floor(lon / NAK_SIZE);
    const inNak = lon - (nakIndex * NAK_SIZE);
    const fracRemaining = 1 - (inNak / NAK_SIZE);
    const startLord = VIMS_ORDER[nakIndex % 9];

    // 5. Timeline Start
    const mdTotal = DurationOfVimsottariDasa[startLord];
    const balance = mdTotal * fracRemaining;
    const elapsed = mdTotal - balance;

    let cursor = birthUTC.minus({ days: elapsed * SOLAR_YEAR });
    const timeline = [];

    // Calculate 9 Mahadashas
    let startIndex = VIMS_ORDER.indexOf(startLord);
    for (let i = 0; i < 9; i++) {
        const lord = VIMS_ORDER[(startIndex + i) % 9];
        const years = DurationOfVimsottariDasa[lord];
        const start = cursor;
        const end = cursor.plus({ days: years * SOLAR_YEAR });

        timeline.push({
            lord,
            start: start.toFormat('yyyy-MM-dd HH:mm:ss'),
            end: end.toFormat('yyyy-MM-dd HH:mm:ss')
        });

        cursor = end;
    }

    console.log(JSON.stringify({
        debug: {
            moonLongitude: lon.toFixed(6),
            nakIndex,
            fracRemaining: fracRemaining.toFixed(6),
            startLord,
            mdBalanceYears: balance.toFixed(6)
        },
        timeline
    }, null, 2));
}

calculateExpected();
