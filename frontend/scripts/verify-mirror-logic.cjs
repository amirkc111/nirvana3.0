
const { DateTime } = require('luxon');

// This script mocks the Vimshottari and then applies the Tribhagi mirroring logic
// to see if the Lords match.

const VIMS_STATE = {
    Lord: "Venus",
    StartDate: DateTime.fromISO("2006-01-01T00:00:00Z"),
    EndDate: DateTime.fromISO("2026-01-01T00:00:00Z"),
    ChildDasha: [
        { Lord: "Venus", StartDate: DateTime.fromISO("2006-01-01T00:00:00Z"), EndDate: DateTime.fromISO("2009-05-01T00:00:00Z") },
        { Lord: "Sun", StartDate: DateTime.fromISO("2009-05-01T00:00:00Z"), EndDate: DateTime.fromISO("2010-05-01T00:00:00Z") },
        { Lord: "Moon", StartDate: DateTime.fromISO("2010-05-01T00:00:00Z"), EndDate: DateTime.fromISO("2012-01-01T00:00:00Z") }
        // ... abbreviated
    ]
};

function applyTribhagiSegmentation(md) {
    const mdDurationMillis = md.EndDate.toMillis() - md.StartDate.toMillis();
    const segments = [
        { portion: 0.25, label: "1" },
        { portion: 0.50, label: "2" },
        { portion: 0.25, label: "3" }
    ];

    let cursor = md.StartDate;
    const results = [];

    for (const seg of segments) {
        const segDur = mdDurationMillis * seg.portion;
        const segEnd = cursor.plus({ milliseconds: segDur });

        results.push({
            Lord: md.Lord,
            Label: seg.label,
            StartDate: cursor,
            EndDate: segEnd,
            ChildDasha: md.ChildDasha.filter(ad => ad.StartDate < segEnd && ad.EndDate > cursor)
        });
        cursor = segEnd;
    }
    return results;
}

const segments = applyTribhagiSegmentation(VIMS_STATE);

console.log(`Original Vimshottari MD: ${VIMS_STATE.Lord}`);
console.log(`--- Tribhagi Segments ---`);
segments.forEach(s => {
    console.log(`Lord: ${s.Lord} | Part: ${s.Label} | Range: ${s.StartDate.toISO()} to ${s.EndDate.toISO()}`);
    console.log(`  Included ADs: ${s.ChildDasha.map(ad => ad.Lord).join(', ')}`);
});

const testDate = DateTime.fromISO("2024-01-01T00:00:00Z");
const active = segments.find(s => testDate >= s.StartDate && testDate < s.EndDate);
if (active) {
    console.log(`\nTest date ${testDate.toISO()} falls in: ${active.Lord} Part ${active.Label}`);
}
