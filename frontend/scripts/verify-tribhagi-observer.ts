
import { DateTime } from "luxon";
import { resolveTribhagi } from "../lib/vedicjyotish/services/calcTribhagiDasha/index";

async function verifyObserver() {
    // Mock Vimshottari State (e.g., Shukra MD, Chandra AD)
    const mockVimState = {
        maha: "Venus",
        maha_start: DateTime.now().minus({ years: 10 }),
        maha_end: DateTime.now().plus({ years: 10 }),
        antar: "Moon",
        prat: "Rahu"
    };

    const now = DateTime.now().toISO();

    console.log("--- Testing Tribhagi Observer Pattern ---");
    console.log("Input Vimshottari State:", JSON.stringify(mockVimState, null, 2));

    try {
        const result = resolveTribhagi(mockVimState, now);
        console.log("Result:", JSON.stringify(result, null, 2));

        if (result.maha !== mockVimState.maha) {
            console.error("FAIL: Mahadasha mismatch! Observer failed.");
            process.exit(1);
        }
        if (result.antar !== mockVimState.antar) {
            console.error("FAIL: Antardasha mismatch! Observer failed.");
            process.exit(1);
        }
        if (result.prat !== mockVimState.prat) {
            console.error("FAIL: Pratyantar mismatch! Observer failed.");
            process.exit(1);
        }

        console.log("SUCCESS: Tribhagi correctly inherited Vimshottari Lords.");
        console.log(`Phase Calculated: ${result.phase}`);

    } catch (e) {
        console.error("Error during verification:", e);
        process.exit(1);
    }

    // Test Fail Safe
    console.log("\n--- Testing Fail Safe ---");
    try {
        resolveTribhagi(mockVimState, now, { seed: 123 });
        console.error("FAIL: Fail-safe did NOT trigger on 'seed' input.");
    } catch (e) {
        console.log("SUCCESS: Fail-safe triggered as expected on 'seed' input.");
    }
}

verifyObserver();
