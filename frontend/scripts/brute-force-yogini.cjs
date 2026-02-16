const { DateTime } = require('luxon');

const YOGINI_ORDER = [
    "Mangala", "Pingala", "Dhanya", "Bhramari",
    "Bhadrika", "Ulka", "Siddha", "Sankata"
];

const YOGINI_YEARS = {
    "Mangala": 1, "Pingala": 2, "Dhanya": 3, "Bhramari": 4,
    "Bhadrika": 5, "Ulka": 6, "Siddha": 7, "Sankata": 8
};

const SOLAR_YEAR = 365.2422;

const birthUTC = DateTime.fromObject({ year: 1990, month: 1, day: 1, hour: 1, minute: 0, second: 0 }, { zone: 'utc' });
const targetDate = DateTime.fromObject({ year: 2026, month: 1, day: 3, hour: 12, minute: 30 }, { zone: 'utc' });
const moonLon = 303.394;
const NAK_SIZE = 13 + 20 / 60;
const nakIndex = Math.floor(moonLon / NAK_SIZE);
const fracRemaining = 1 - ((moonLon % NAK_SIZE) / NAK_SIZE);

console.log(`Birth: ${birthUTC.toISO()}`);
console.log(`Target: ${targetDate.toISO()}`);
console.log(`nakIndex: ${nakIndex}, fracRemaining: ${fracRemaining.toFixed(6)}`);

// Brute force formulas and sequencing
for (let offset = 0; offset < 8; offset++) {
    const mdIndex = (nakIndex + offset) % 8;
    const mdName = YOGINI_ORDER[mdIndex];
    if (mdName !== "Sankata") continue; // User says Sankata is correct

    const mdDuration = YOGINI_YEARS[mdName];
    const balance = mdDuration * fracRemaining;
    const mdStart = birthUTC.minus({ days: (mdDuration - balance) * SOLAR_YEAR });

    // Check 2nd cycle (age ~36)
    const md2Start = mdStart.plus({ days: 36 * SOLAR_YEAR });
    const md2End = md2Start.plus({ days: mdDuration * SOLAR_YEAR });

    if (targetDate >= md2Start && targetDate < md2End) {
        console.log(`\nValid MD: Offset ${offset} -> ${mdName} (${md2Start.toFormat('yyyy-MM-dd')} to ${md2End.toFormat('yyyy-MM-dd')})`);

        const elapsedInMD = targetDate.diff(md2Start, 'days').days / SOLAR_YEAR;
        console.log(`Elapsed in MD: ${elapsedInMD.toFixed(6)} years`);

        // Test AD starts
        for (let adOffset = 0; adOffset < 8; adOffset++) {
            const adStartName = YOGINI_ORDER[adOffset];
            const adSequence = [...YOGINI_ORDER.slice(adOffset), ...YOGINI_ORDER.slice(0, adOffset)];

            let cursor = 0;
            adSequence.forEach(name => {
                const duration = (mdDuration * YOGINI_YEARS[name]) / 36;
                if (elapsedInMD >= cursor && elapsedInMD < cursor + duration) {
                    const pdElapsed = elapsedInMD - cursor;

                    // Test PD starts
                    for (let pdOffset = 0; pdOffset < 8; pdOffset++) {
                        const pdStartName = YOGINI_ORDER[pdOffset];
                        const pdSequence = [...YOGINI_ORDER.slice(pdOffset), ...YOGINI_ORDER.slice(0, pdOffset)];

                        let pdCursor = 0;
                        pdSequence.forEach(pdName => {
                            const pdDuration = (duration * YOGINI_YEARS[pdName]) / 36;
                            if (pdElapsed >= pdCursor && pdElapsed < pdCursor + pdDuration) {
                                if (name === "Siddha" && pdName === "Dhanya") {
                                    console.log(`MATCH FOUND!`);
                                    console.log(`AD Sequence start: ${adStartName}`);
                                    console.log(`PD Sequence start: ${pdStartName}`);
                                }
                            }
                            pdCursor += pdDuration;
                        });
                    }
                }
                cursor += duration;
            });
        }
    }
}
