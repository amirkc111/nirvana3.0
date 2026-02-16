
import { resolveTribhagi } from "../lib/vedicjyotish/services/calcTribhagiDasha/index";
import { DateTime } from "luxon";

console.log("Verifying Tribhagi Resolver (TS)...");

// 1. Happy Path
const state = {
    maha: "Venus",
    maha_start: "2080-01-01",
    maha_end: "2085-01-01",
    antar: "Moon",
    prat: "Rahu"
};
const today = "2082-06-15";

try {
    const res = resolveTribhagi(state, today);
    console.log("Result:", JSON.stringify(res, null, 2));

    if (res.phase === "Madhya (½)") {
        console.log("PASS: Phase Correct");
    } else {
        console.error("FAIL: Phase Mismatch", res.phase);
    }
} catch (e) {
    console.error("FAIL Happy Path:", e);
}

// 2. Fail Safe - Seed
console.log("\nTesting Fail Safe (Seed)...");
try {
    resolveTribhagi(state, today, { seed: 123 });
    console.error("FAIL: Should have thrown Error");
} catch (e: any) {
    if (e.message.includes("TRIBHAGI MUST NOT USE SEED")) {
        console.log("PASS: Error caught");
    } else {
        console.error("FAIL: Wrong error message", e.message);
    }
}

// 3. Fail Safe - V Index
console.log("\nTesting Fail Safe (V-Index)...");
try {
    resolveTribhagi(state, today, { V1: "test" });
    console.error("FAIL: Should have thrown Error");
} catch (e: any) {
    if (e.message.includes("TRIBHAGI USING VIMSHOTTARI INDEX")) {
        console.log("PASS: Error caught");
    } else {
        console.error("FAIL: Wrong error message", e.message);
    }
}
