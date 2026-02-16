
import gunaMilanService from '../lib/gunaMilanService';

// Mock specific longitudes
// Aries 0 deg: Ashwini, Aries. Varna: Kshatriya. Yoni: Horse.
const maleLon = 0.5;

// Taurus 30 deg: Krittika (starts 26.66 in Aries, ends 40.00 in Taurus). 
// Wait, Krittika span: 26°40' to 40°00'. 
// 30 deg is inside Krittika (Taurus side). 
// Taurus Varna: Vaishya. Krittika Yoni: Sheep.
const femaleLon = 30.5;

const res = gunaMilanService.calculateMatching(maleLon, femaleLon);

console.log("--- TEST RESULTS ---");
console.log("Male Longitude: 0.5 (Aries, Ashwini)");
console.log("Female Longitude: 30.5 (Taurus, Krittika)");
console.log("--------------------");

console.log("Varna [Male should be Kshatriya, Female should be Vaishya]");
console.log(`Male: ${res.scores.varna.male}`);
console.log(`Female: ${res.scores.varna.female}`);

console.log("Yoni [Male should be Horse, Female should be Sheep]");
console.log(`Male: ${res.scores.yoni.male}`);
console.log(`Female: ${res.scores.yoni.female}`);

console.log("--------------------");
if (res.scores.varna.male === 'Kshatriya' && res.scores.varna.female === 'Vaishya' &&
    res.scores.yoni.male === 'Horse' && res.scores.yoni.female === 'Sheep') {
    console.log("✅ CHECK PASSED: Data is NOT swapped.");
} else {
    console.error("❌ CHECK FAILED: Data IS swapped or incorrect.");
}
