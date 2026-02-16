
import swisseph from 'swisseph';

function debug() {
    console.log("--- Debugging swisseph mooncross ---");

    console.log("Has swe_mooncross_ut:", swisseph.swe_mooncross_ut !== undefined);
    console.log("Has swe_mooncross:", swisseph.swe_mooncross !== undefined);

    // Check if maybe it's under a different name or capitalisation?
    const keys = Object.keys(swisseph);
    const moonKeys = keys.filter(k => k.toLowerCase().includes('mooncross'));
    console.log("Keys matching 'mooncross':", moonKeys);
}

debug();
