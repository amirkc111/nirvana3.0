
const { DateTime } = require('luxon');

const DurationOfVimsottariDasa = {
    Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
    Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17
};

const VIMS_ORDER = [
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"
];

const SOLAR_YEAR = 365.2422;

function calcTribhagiDashaMock(fracRemaining, nakIndex, birthUTC) {
    const startPlanet = VIMS_ORDER[nakIndex % 9];
    const mdTotalVims = DurationOfVimsottariDasa[startPlanet];
    const balanceVims = mdTotalVims * fracRemaining;

    const mdTotalTrib = mdTotalVims / 3;
    const balanceTrib = balanceVims / 3;

    const elapsedTrib = mdTotalTrib - balanceTrib;
    const cycleStartDate = birthUTC.minus({ days: elapsedTrib * SOLAR_YEAR });

    const totalTimeline = [];
    let cursor = cycleStartDate;

    for (let cycleCount = 0; cycleCount < 3; cycleCount++) {
        const fullSequence = [...VIMS_ORDER.slice(nakIndex % 9), ...VIMS_ORDER.slice(0, nakIndex % 9)];

        for (const lord of fullSequence) {
            const vimsDuration = DurationOfVimsottariDasa[lord];
            const tribDuration = vimsDuration / 3;

            const segments = [
                { portion: 0.25, label: "1" },
                { portion: 0.50, label: "2" },
                { portion: 0.25, label: "3" }
            ];

            for (const seg of segments) {
                const segDuration = tribDuration * seg.portion;
                const endDate = cursor.plus({ days: segDuration * SOLAR_YEAR });

                totalTimeline.push({
                    Lord: lord,
                    Label: seg.label,
                    StartDate: cursor,
                    EndDate: endDate
                });
                cursor = endDate;
            }
        }
    }
    return totalTimeline;
}

const birth = DateTime.fromObject({ year: 1990, month: 1, day: 1, hour: 1, minute: 0, second: 0 }, { zone: 'utc' });
// 1990 birth has fracRemaining = 0.2455, nakIndex = 22
const dashas = calcTribhagiDashaMock(0.2455, 22, birth);

console.log(`Birth: ${birth.toISO()}`);
console.log(`Current: ${DateTime.fromObject({ year: 2026, month: 1, day: 3 }, { zone: 'utc' }).toISO()}`);

const today = DateTime.fromObject({ year: 2026, month: 1, day: 3 }, { zone: 'utc' });
const active = dashas.find(d => today >= d.StartDate && today < d.EndDate);

if (active) {
    console.log(`Active MD Today: ${active.Lord} (Part ${active.Label})`);
    console.log(`Window: ${active.StartDate.toISO()} to ${active.EndDate.toISO()}`);
} else {
    console.log("No active dasha found for today in the 120-year range.");
}
