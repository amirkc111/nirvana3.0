
async function debug() {
    console.log("--- Debugging sweph-wasm (Dynamic Import) ---");
    try {
        const swephWasm = await import('sweph-wasm');
        console.log("Module loaded.");

        try {
            const SweClass = swephWasm.default;
            console.log("Class retrieved.");

            const swe = new SweClass();
            console.log("Instance created.");

            if (swe.is_init) {
                console.log("is_init exists. Value:", swe.is_init());
                if (!swe.is_init()) {
                    console.log("Calling init()...");
                    await swe.init();
                    console.log("init() returned.");
                } else {
                    console.log("Already initialized.");
                }
            } else {
                console.log("is_init MISSING on instance.");
            }

            // Inspect internal state if possible (usually on module)
            console.log("_swe_set_sid_mode type:", typeof swe._swe_set_sid_mode);
            console.log("swe_set_sid_mode type:", typeof swe.swe_set_sid_mode);

            // Try function
            console.log("Trying swe_deltat...");
            const dt = swe.swe_deltat(2451545.0);
            console.log("swe_deltat result:", dt);

        } catch (e) {
            console.error("Inner Error:", e);
        }

    } catch (e) {
        console.error("Outer Error:", e);
    }
}

debug();
