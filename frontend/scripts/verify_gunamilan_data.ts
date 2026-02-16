
import { getNakshatra } from '../lib/vedicjyotish/constants/Nakshatra';
import { getRasi } from '../lib/vedicjyotish/constants/Rasi';
import gunaMilanService from '../lib/gunaMilanService';
import { GunaMilanService } from '../lib/gunaMilanService';

// Extract maps from the service (we might need to export them or inspect via instance if possible, 
// but since they are not exported, we will test via the public methods)

console.log("Starting Verification of Guna Milan Data...");

const service = gunaMilanService;

let errors = 0;

// 1. Check Rasi mappings using calculateMatching (mocking inputs)
// We need to hit every Rasi. 
// Rasi spans 30 degrees. 
// Varna, Vashya, Graha Maitri, Bhakoot depend on Rasi.

console.log("Checking Rasi-based Kootas (Varna, Vashya, Graha Maitri, Bhakoot)...");
for (let i = 0; i < 360; i += 15) { // Step by 15 deg to cover all 12 rasis (30 deg each) and halves
    const rasi = getRasi(i);
    const mockFemaleRasi = getRasi((i + 120) % 360); // some other rasi

    // We can't access calcVarna directly easily if it's protected or we need to construct inputs.
    // But calculateMatching calls them.
    // We need to construct Moon Longitudes such that they fall into specific Rasis and Nakshatras.

    const res = service.calculateMatching(i, (i + 120) % 360);

    // Check Varna
    if (!res.scores.varna.male || res.scores.varna.male === 'Unknown') {
        console.error(`[FAIL] Varna missing for Rasi ${rasi.name.english} (Lon: ${i})`);
        errors++;
    }
    // Check Vashya
    if (!res.scores.vashya.male || res.scores.vashya.male === 'Unknown') {
        console.error(`[FAIL] Vashya missing for Rasi ${rasi.name.english} (Lon: ${i})`);
        errors++;
    }
    // Check Graha Maitri
    if (!res.scores.grahaMaitri.male || res.scores.grahaMaitri.male === 'Unknown' || res.scores.grahaMaitri.male === undefined) {
        // Graha Maitri returns the planet name, verify it is defined
        console.error(`[FAIL] Graha Maitri Lord missing for Rasi ${rasi.name.english} (Lon: ${i})`);
        errors++;
    }
}

// 2. Check Nakshatra mappings (Tara, Yoni, Gana, Nadi)
console.log("Checking Nakshatra-based Kootas (Yoni, Gana, Nadi)...");
// Nakshatra is 13.3333 deg.
const degPerNak = 360 / 27;
for (let n = 0; n < 27; n++) {
    const lon = (n * degPerNak) + 1; // Middle of nakshatra roughly
    const nak = getNakshatra(lon);

    const res = service.calculateMatching(lon, (lon + 50) % 360);

    // Check Yoni
    if (!res.scores.yoni.male || res.scores.yoni.male === 'Unknown') {
        console.error(`[FAIL] Yoni missing for Nakshatra ${nak.name.english}`);
        errors++;
    }
    // Check Gana
    if (!res.scores.gana.male || res.scores.gana.male === 'Unknown') {
        console.error(`[FAIL] Gana missing for Nakshatra ${nak.name.english}`);
        errors++;
    }
    // Check Nadi
    if (!res.scores.nadi.male || res.scores.nadi.male === 'Unknown') {
        console.error(`[FAIL] Nadi missing for Nakshatra ${nak.name.english}`);
        errors++;
    }
}

if (errors === 0) {
    console.log("✅ All Systems Normal. No missing data found in mappings.");
} else {
    console.error(`❌ Found ${errors} errors.`);
}
