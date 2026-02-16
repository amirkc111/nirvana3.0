
import { kundaliGenerationService } from "../lib/kundaliGenerationService";
import { DateTime } from "luxon";

console.log("Starting Routing Verification...");

// Mock input for panchang data required by calculateDasha
const mockKundaliData = {
    datetime: DateTime.now().minus({ years: 30 }), // 30 year old
    panchanga: {
        tjd_ut: 2450000.5, // Arbitrary JD
        nakshatra: {
            // Need just enough for calcVimsottariDasa to not crash?
            // Actually calculateDasha calls calcVimsottariDasa(tjd_ut, nakshatra, dob)
            // calcVimsottariDasa uses computeDashaPoint(birthUTC) internally and ignores nakshatra arg mostly?
            // Let's provide a dummy
            sign: 1, degree: 10, name: { english: "Ashwini" }, lord: "Ketu"
        }
    }
};

async function test() {
    try {
        console.log("Initializing Service...");
        await kundaliGenerationService.initialize();

        console.log("Calling calculateDasha...");
        const result = kundaliGenerationService.calculateDasha(mockKundaliData, DateTime.now());

        if (result && result.tribhagi) {
            console.log("Tribhagi Result Present!");
            console.log("Tribhagi Current:", result.tribhagi.current);
            console.log("Phase:", result.tribhagi.phase);
        } else {
            console.log("No Tribhagi result found in output.");
        }
    } catch (e) {
        console.error("Test Error:", e);
    }
}

test();
