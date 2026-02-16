
import { kundaliGenerationService } from '../lib/kundaliGenerationService.js';
import { DateTime } from 'luxon';

// Mock Data
const mockTargetDate = DateTime.now();
const mockKundaliData = {
    datetime: "1990-01-01T12:00:00",
    panchanga: {
        tjd_ut: 2447893.0, // Approx Julian Date
        nakshatra: {
            id: 1,
            name: { english: "Ashwini" },
            lord: "Ketu",
            degree: 10.5
        }
    },
    // Mocking minimal planetary data if needed by other parts, 
    // though calculateDasha mainly needs panchanga
    Sun: { degree: 200, rasi: { rasi_num: 7 } },
    Moon: { degree: 10, rasi: { rasi_num: 1 } },
    Ascendant: { degree: 100 }
};

console.log("Running Verification for Tribhagi Timeline...");
try {
    const result = kundaliGenerationService.calculateDasha(mockKundaliData, mockTargetDate);

    if (result && result.tribhagi) {
        console.log("Tribhagi Data Found.");

        const timeline = result.tribhagi.timeline;
        console.log(`Timeline Length: ${timeline.length}`);

        if (timeline.length > 0) {
            console.log("First 3 Timeline Items:");
            timeline.slice(0, 3).forEach((item, idx) => {
                console.log(`[${idx}] Lord: ${item.lord}, Start: ${item.start}, End: ${item.end}`);
            });
        }

        if (timeline.length === 9) {
            console.log("SUCCESS: Timeline has exactly 9 items.");
        } else {
            console.log(`FAIL: Timeline has ${timeline.length} items (Expected 9).`);
        }

    } else {
        console.error("Tribhagi data missing in result.", result);
    }

} catch (e) {
    console.error("Execution Error:", e);
}
