
const { DateTime } = require('luxon');
// We use the compiled JS if available, but here we can just mock the dasha logic or use jiti to load TS
// For speed, let's just implement the CORE LOGIC of calcTribhagiDasha here to trace it.

const VIMS_ORDER = [
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"
];

const DurationMap = {
    Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
    Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17
};

const SOLAR_YEAR = 365.2422;

function reorderArray(arr, startElement) {
    const startIndex = arr.indexOf(startElement);
    if (startIndex === -1) return arr;
    return [...arr.slice(startIndex), ...arr.slice(0, startIndex)];
}

function computeVimsDasha(parentLord, startDate, parentDuration, level) {
    const sequence = reorderArray(VIMS_ORDER, parentLord);
    let cursor = startDate;
    return sequence.map(lord => {
        const durationYears = (DurationMap[lord] * parentDuration) / 120;
        const endDate = cursor.plus({ days: durationYears * SOLAR_YEAR });
        const entry = {
            Lord: lord,
            StartDate: cursor,
            EndDate: endDate,
            ChildDasha: level < 3 ? computeVimsDasha(lord, cursor, durationYears, level + 1) : []
        };
        cursor = endDate;
        return entry;
    });
}

function calcVimsottari(birthUTC, fracRemaining, nakIndex) {
    const mdLord = VIMS_ORDER[nakIndex % 9];
    const mdTotal = DurationMap[mdLord];
    const mdBalanceYears = mdTotal * fracRemaining;
    const elapsedYears = mdTotal - mdBalanceYears;
    const StartDate = birthUTC.minus({ days: elapsedYears * SOLAR_YEAR });

    return computeVimsDasha(mdLord, StartDate, 120, 1);
}

function calcTribhagi(birthUTC, fracRemaining, nakIndex) {
    const vimsTimeline = calcVimsottari(birthUTC, fracRemaining, nakIndex);
    const totalTimeline = [];

    for (const md of vimsTimeline) {
        const mdDurationMillis = md.EndDate.toMillis() - md.StartDate.toMillis();
        const segments = [0.25, 0.50, 0.25];
        let cursor = md.StartDate;

        segments.forEach((portion, idx) => {
            const segDur = mdDurationMillis * portion;
            const segEnd = cursor.plus({ milliseconds: segDur });

            totalTimeline.push({
                Lord: md.Lord,
                Part: idx + 1,
                StartDate: cursor,
                EndDate: segEnd,
                ChildDasha: (md.ChildDasha || []).filter(ad => ad.StartDate < segEnd && ad.EndDate > cursor)
            });
            cursor = segEnd;
        });
    }
    return totalTimeline;
}

function findActive(tree, target) {
    const targetMs = target.toMillis();
    return tree.find(p => targetMs >= p.StartDate.toMillis() && targetMs < p.EndDate.toMillis());
}

// TEST CASE:
// Native is born in Venus MD. Let's say Venus has 10 years remaining at birth in 1990.
// Birth: 1990-01-01
// Venus MD total=20. Remaining=10. So elapsed=10.
// StartDate of MD = 1980-01-01.
const birth = DateTime.fromISO("1990-01-01T00:00:00Z");
const now = DateTime.fromISO("2026-01-03T00:00:00Z");

const nakIndex = 1; // Venus
const fracRemaining = 0.5; // 10/20

const tribTree = calcTribhagi(birth, fracRemaining, nakIndex);
const activeMD = findActive(tribTree, now);

if (activeMD) {
    console.log(`Now (${now.toISO()}): MD = ${activeMD.Lord} (Part ${activeMD.Part})`);
    const activeAD = findActive(activeMD.ChildDasha, now);
    if (activeAD) {
        console.log(`  AD = ${activeAD.Lord}`);
        const activePD = findActive(activeAD.ChildDasha, now);
        if (activePD) console.log(`  PD = ${activePD.Lord}`);
    }
} else {
    console.log("No active MD found.");
}
