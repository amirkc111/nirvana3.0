
// Pure JS Mock Logic for Dasha Cycle Verification
// No external deps

const TRIBHAGI_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
const TRIBHAGI_YEARS = {
    Sun: 4, Moon: 6.666666666, Mars: 4.666666666, Rahu: 12,
    Jupiter: 10.66666666, Saturn: 12.66666666, Mercury: 11.33333333,
    Ketu: 4.666666666, Venus: 13.33333333
};

const YOGINI_ORDER = ["Mangala", "Pingala", "Dhanya", "Bhramari", "Bhadrika", "Ulka", "Siddha", "Sankata"];
const YOGINI_YEARS = {
    Mangala: 1, Pingala: 2, Dhanya: 3, Bhramari: 4,
    Bhadrika: 5, Ulka: 6, Siddha: 7, Sankata: 8
};

function testTribhagi(moonLon) {
    console.log("=== TRIBHAGI TIMELINE SIMULATION ===");
    const nakSize = 13.333333333;
    const nakIndex = Math.floor(moonLon / nakSize);
    const fracTraversed = (moonLon % nakSize) / nakSize;
    const fracRemaining = 1.0 - fracTraversed;

    const lordIndex = nakIndex % 9;
    const startLord = TRIBHAGI_ORDER[lordIndex];

    console.log(`MoonLon: ${moonLon}, NakIndex: ${nakIndex}, StartLord: ${startLord}`);
    console.log(`Balance Fraction: ${fracRemaining.toFixed(4)} (Approx First Duration)`);

    let currentIdx = lordIndex;
    let yearsAccumulated = 0;

    // 1. Balance Dasha
    let duration = TRIBHAGI_YEARS[startLord] * fracRemaining;
    console.log(`1. ${startLord}: ${duration.toFixed(2)} years (Ends at Age: ${(yearsAccumulated + duration).toFixed(2)})`);
    yearsAccumulated += duration;

    // 2. Subsequent Dashas (up to 100 years)
    let step = 2;
    while (yearsAccumulated < 100) {
        currentIdx = (currentIdx + 1) % 9;
        const name = TRIBHAGI_ORDER[currentIdx];
        duration = TRIBHAGI_YEARS[name];

        yearsAccumulated += duration;
        console.log(`${step}. ${name}: ${duration.toFixed(2)} years (Ends at Age: ${yearsAccumulated.toFixed(2)})`);
        step++;
    }
}

function testYogini(nakIndex) {
    console.log("\n=== YOGINI TIMELINE SIMULATION ===");
    // Canonical Yogini Start: (NakIndex + 3) % 8
    const startIdx = (nakIndex + 3) % 8;
    const startName = YOGINI_ORDER[startIdx];

    // Mock fraction remaining (e.g. 0.5)
    const fracRemaining = 0.5;

    console.log(`NakIndex: ${nakIndex}, StartName: ${startName} (Offset +3)`);

    // Initial Cycle Logic Check

    // My Code structure:
    // 1. Calculate cycleStartDate (Birth - Elapsed)
    // 2. Loop cycles

    const startDuration = YOGINI_YEARS[startName];
    const elapsed = startDuration * (1 - fracRemaining);
    // Cycle Start is 'elapsed' years BEFORE birth.
    // So Birth is at t = elapsed.

    let cycleStartT = -elapsed;
    console.log(`Cycle Starts at t=${cycleStartT.toFixed(2)} (Birth at t=0)`);

    let cursor = cycleStartT;

    for (let c = 0; c < 4; c++) {
        console.log(`--- Cycle ${c + 1} ---`);

        // computeDasha logic iterates 8 planets starting from startName
        // If startName is Sankata, sequence is: Sankata, Mangala, Pingala... Siddha

        // Let's create the sequence exactly as my code does:
        const idx = YOGINI_ORDER.indexOf(startName);
        const sequence = [...YOGINI_ORDER.slice(idx), ...YOGINI_ORDER.slice(0, idx)];

        let subCursor = cursor;

        for (let i = 0; i < 8; i++) {
            const pName = sequence[i];
            const duration = YOGINI_YEARS[pName];
            subCursor += duration;

            // Filter Logic:
            // if (EndDate > Birth && StartDate < Limit)
            const startT = subCursor - duration;
            const endT = subCursor;
            const birthT = 0;
            const limitT = 100;

            let visible = "HIDDEN";
            if (endT > birthT && startT < limitT) {
                visible = "SHOW";
            }

            console.log(`  ${pName}: ${duration}y [${startT.toFixed(2)} to ${endT.toFixed(2)}] (${visible})`);
        }
        cursor = subCursor;
    }
}

testTribhagi(200);
testYogini(15);
