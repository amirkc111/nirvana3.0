const VIMS_ORDER = [
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"
];

const DurationMap = {
    Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
    Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17
};

function checkAntarSum(parentLord, parentDuration) {
    console.log(`--- Antardasha Duration Check for ${parentLord} MD (${parentDuration} years) ---`);

    // Reorder sequence starting from parentLord
    const startIndex = VIMS_ORDER.indexOf(parentLord);
    const sequence = [...VIMS_ORDER.slice(startIndex), ...VIMS_ORDER.slice(0, startIndex)];

    let totalSum = 0;
    sequence.forEach(lord => {
        const antarYears = (DurationMap[lord] * parentDuration) / 120;
        console.log(`${lord.padEnd(8)}: (${DurationMap[lord]} * ${parentDuration}) / 120 = ${antarYears.toFixed(6)} years`);
        totalSum += antarYears;
    });

    console.log(`-------------------------------------------`);
    console.log(`TOTAL SUM: ${totalSum.toFixed(6)} years`);
    console.log(`EXPECTED : ${parentDuration.toFixed(6)} years`);
    console.log(`DIFF     : ${(totalSum - parentDuration).toFixed(12)}`);
}

checkAntarSum("Mars", 7);
