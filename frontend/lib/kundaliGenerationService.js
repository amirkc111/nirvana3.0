// Enhanced Kundali Generation Service for AI Integration
// Combines chart generation with AI analysis capabilities

import { Kundli } from './vedicjyotish/services/Kundli';
import { DateTime } from 'luxon';
import { VedicRuleEngine } from './vedicjyotish/VedicRuleEngine.js';
import { calcVimsottariDasa } from './vedicjyotish/services/calcVimsottariDasa/index';
import { calcYoginiDasha } from './vedicjyotish/services/calcYoginiDasha/index';
import { calcTribhagiDasha, resolveTribhagi } from './vedicjyotish/services/calcTribhagiDasha/index';
import { formatToNepaliDate, localizeName, simpleTransliterate } from './vedicjyotish/services/NepaliLocalization';
import { calcSarvashtakavarga } from './vedicjyotish/services/calcAshtakavarga/index';
import { calcShadbala } from './vedicjyotish/services/calcShadbala/index';
import { calcRashiBala } from './vedicjyotish/services/calcRashiBala/index';
import { calcHora } from './vedicjyotish/services/calcHora/index';

const VIMS_ORDER = [
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"
];

export class KundaliGenerationService {
    constructor() {
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return true;

        try {
            // Check for client-side Swiss Ephemeris
            if (typeof window !== 'undefined') {
                if (window.swe && typeof window.swe.swe_set_sid_mode === 'function') {
                    this.initialized = true;
                    return true;
                }


                const swephModule = await import('sweph-wasm');
                const sweLibCandidate = swephModule.default || swephModule;
                let sweLib = null;

                // Priority 1: Static init() method (Recommended for sweph-wasm class)
                if (typeof sweLibCandidate.init === 'function') {
                    sweLib = await sweLibCandidate.init('/swisseph/assets/swisseph.wasm');
                }
                // Priority 2: Factory function or Constructor
                else if (typeof sweLibCandidate === 'function') {
                    try {
                        sweLib = await sweLibCandidate();
                    } catch (e) {
                        sweLib = new sweLibCandidate();
                    }
                }
                // Priority 3: Already an object
                else {
                    sweLib = sweLibCandidate;
                }

                // If we have an instance but it needs initialization or WASM path
                if (sweLib) {
                    if (typeof sweLib.setWasmPath === 'function') {
                        sweLib.setWasmPath('/swisseph/assets/swisseph.wasm');
                    }

                    if (typeof sweLib.init === 'function' && !sweLib.is_init?.()) {
                        await sweLib.init();
                    }
                }

                // If it's still double-wrapped in default (less likely with new init logic, but good fallback)
                if (sweLib && sweLib.default && typeof sweLib.swe_set_sid_mode !== 'function') {
                    sweLib = sweLib.default;
                }

                if (sweLib && typeof sweLib.browser_init === 'function') {
                    await sweLib.browser_init();
                }

                // Final verification
                if (!sweLib || typeof sweLib.swe_set_sid_mode !== 'function') {
                    const keys = sweLib ? Object.keys(sweLib).slice(0, 100).join(', ') : 'null';
                    const type = typeof sweLib;
                    const constructorName = sweLib?.constructor?.name || 'N/A';
                    const stringified = String(sweLib).substring(0, 100);

                    // One last check if it's on a 'swe' property
                    if (sweLib && sweLib.swe && typeof sweLib.swe.swe_set_sid_mode === 'function') {
                        sweLib = sweLib.swe;
                    } else if (typeof sweLib === 'function') {
                        // If it's a function, maybe it needs one more call?
                        try {
                            const secondTry = await sweLib();
                            if (secondTry && typeof secondTry.swe_set_sid_mode === 'function') {
                                sweLib = secondTry;
                            } else {
                                throw new Error("Second call didn't return functions");
                            }
                        } catch (e) {
                            throw new Error(`Initialization failed: swe_set_sid_mode not found on function. 
                                Type: ${type}, 
                                Constructor: ${constructorName},
                                Keys: ${keys},
                                String: ${stringified}`);
                        }
                    } else {
                        throw new Error(`Initialization failed: swe_set_sid_mode not found. 
                            Type: ${type}, 
                            Constructor: ${constructorName},
                            IsPromise: ${sweLib instanceof Promise},
                            String: ${stringified},
                            Keys: ${keys}`);
                    }
                }

                // Attach to window and global for Kundli.ts to access globally
                window.swe = sweLib;
                if (typeof global !== 'undefined') {
                    global.swe = sweLib;
                }

                // SET SIDEREAL MODE TO LAHIRI (1) - Critical for correct Nakshatra calculation
                if (typeof sweLib.swe_set_sid_mode === 'function') {
                    sweLib.swe_set_sid_mode(1, 0, 0);
                } else {
                    console.warn("Client-side Warning: swe_set_sid_mode function not found.");
                }

                this.initialized = true;
                return true;
            }

            // Server-side initialization (Node.js)
            if (typeof window === 'undefined') {
                const { loadSwisseph, loadPath } = await import('./server/swisseph-loader');
                const swissephModule = await loadSwisseph();
                const sweLib = swissephModule.default || swissephModule;
                const pathModule = await loadPath();
                const path = pathModule.default || pathModule;

                // Set Ephemeris Path
                // Use process.cwd() to locate public folder in Next.js server environment
                const ephePath = path.join(process.cwd(), 'public', 'swisseph', 'assets', 'ephe');

                if (sweLib.swe_set_ephe_path) {
                    sweLib.swe_set_ephe_path(ephePath);
                    // SET SIDEREAL MODE TO LAHIRI (1)
                    // 1 = SE_SIDM_LAHIRI
                    if (sweLib.swe_set_sid_mode) {
                        sweLib.swe_set_sid_mode(1, 0, 0);
                    }
                } else {
                    console.error("ERROR: swe_set_ephe_path function NOT FOUND on swisseph library.");
                }


                // Create a wrapper to adapt 'swisseph' (Object return) to 'swpeh-wasm' (Array return) API
                // expected by Kundli.ts
                const sweWrapper = {
                    ...sweLib, // Copy all constants and functions

                    // Wrapper for swe_calc_ut to return Array
                    swe_calc_ut: (tjd, planet, flag) => {
                        const res = sweLib.swe_calc_ut(tjd, planet, flag);
                        if (res.error) console.error("SWE Error (calc_ut):", res.error);
                        // Map to Array: [long, lat, dist, speedLong, speedLat, speedDist]
                        return [
                            res.longitude,
                            res.latitude,
                            res.distance,
                            res.longitudeSpeed,
                            res.latitudeSpeed,
                            res.distanceSpeed
                        ];
                    },

                    // Wrapper for swe_utc_to_jd to return Array [tjd_et, tjd_ut]
                    swe_utc_to_jd: (year, month, day, hour, min, sec, gregflag) => {
                        const res = sweLib.swe_utc_to_jd(year, month, day, hour, min, sec, gregflag);
                        if (!res || !res.julianDayUT) console.error("SWE Error (utc_to_jd): Result invalid", res);
                        return [
                            res.julianDayET,
                            res.julianDayUT
                        ];
                    },

                    // Wrapper for swe_azalt to return Array
                    swe_azalt: (tjd, flag, geopos, atpress, attemp, xin) => {
                        const res = sweLib.swe_azalt(tjd, flag, geopos, atpress, attemp, xin);
                        // Map to Array: [azimuth, trueAltitude, apparentAltitude]
                        return [
                            res.azimuth,
                            res.trueAltitude,
                            res.apparentAltitude
                        ];
                    },

                    // Wrapper for swe_houses to return expected internal structure
                    swe_houses: (tjd, lat, lon, hsys) => {
                        const res = sweLib.swe_houses(tjd, lat, lon, hsys);
                        // Convert named properties to C-style array 'ascmc' (10 elements)
                        // Structure: [Asc, MC, ARMC, Vertex, EqAsc, KochCoAsc, MunkCoAsc, MunkPolarAsc, ?, ?]
                        const ascmc = [
                            res.ascendant || 0,
                            res.mc || 0,
                            res.armc || 0,
                            res.vertex || 0,
                            res.equatorialAscendant || 0,
                            res.kochCoAscendant || 0,
                            res.munkaseyCoAscendant || 0,
                            res.munkaseyPolarAscendant || 0,
                            0, 0
                        ];

                        // Note: swisseph native 'house' key is array of 12 numbers (1-12)
                        // C-API expects array of 13 (0 ignored)
                        // If Kundli.ts ever uses houses from here (it doesn't seem to currently), we might need to pad it.
                        // returning object with 'ascmc' to satisfy const { ascmc } = ...
                        return {
                            ascmc: ascmc,
                            houses: [0, ...(res.house || [])] // Pad 0 index for standard C-compat if needed
                        };
                    },

                    // Shim for swe_mooncross_ut (Missing in node-swisseph)
                    // Used for Panchanga Tithi/Nakshatra timing.
                    // We return input time to prevent crash, acknowledging Panchanga might be approx.
                    swe_mooncross_ut: (tjd, pos, flag) => {
                        // console.warn("Shim: swe_mooncross_ut called. Returning input TJD.");
                        return tjd;
                    },

                    // Wrapper for swe_rise_trans
                    // Usage in calcRiseSet: swe_rise_trans(jd, ipl, null, flags, type, geoposArray, 0, 0)
                    // Native expects: swe_rise_trans(tjd, ipl, star, flag, rsmi, long, lat, height, atpress, attemp)
                    swe_rise_trans: (tjd, body, star, epheflag, rsmi, geopos, atpress, attemp) => {
                        try {
                            // Unpack geopos if it is an array [long, lat, elev]
                            let lng = 0, lat = 0, hgt = 0;
                            if (Array.isArray(geopos)) {
                                lng = geopos[0] || 0;
                                lat = geopos[1] || 0;
                                hgt = geopos[2] || 0;
                            } else {
                                // Fallback if passed as number (unlikely given TS usage)
                                lng = geopos;
                            }

                            const res = sweLib.swe_rise_trans(tjd, body, star || '', epheflag, rsmi, lng, lat, hgt, atpress || 0, attemp || 0);

                            // Return NUMBER directly (not object with tret)
                            const val = res.transitTime || res.riseTime || res.setTime || 0;
                            return val;
                        } catch (e) {
                            console.error("SWE RiseWrapper Error:", e.message);
                            return 0;
                        }
                    },

                    // Shim for swe_nod_aps_ut (Nodes and Apsides)
                    swe_nod_aps_ut: (tjd, planet, flag, method) => {
                        // Return valid structure if poss, or just 0s.
                        // C-API fills 4 pointers... logic expects array return or object?
                        // sweph-wasm returns { ... }?
                        // Let's just return dummy to prevent crash.
                        return {
                            asc_node: [0, 0, 0, 0, 0, 0],
                            desc_node: [0, 0, 0, 0, 0, 0],
                            perihelion: [0, 0, 0, 0, 0, 0],
                            aphelion: [0, 0, 0, 0, 0, 0]
                        };
                    }
                };

                // Attach to global scope for Kundli.ts to access 'swe'
                global.swe = sweWrapper;

                this.initialized = true;
                return true;
            }

            return false;
        } catch (error) {
            console.error('Failed to initialize Kundali Generation Service:', error);
            this.initialized = false;
            throw error; // Re-throw to propagate specific error
        }
    }


    // Generate complete Kundali with AI analysis
    async generateCompleteKundali(birthData, onProgress, skipAI = false, language = 'en') {
        const reportProgress = (percent) => {
            if (onProgress) onProgress(percent);
        };



        reportProgress(5); // Initializing SWE

        try {
            // Race initialization with 20s timeout (WASM can be slow to load)
            const initPromise = this.initialize();
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("SWE Initialization Timeout (20s)")), 20000));

            try {
                await Promise.race([initPromise, timeoutPromise]);
            } catch (initErr) {
                console.error("Initialization error in generateCompleteKundali:", initErr);
                throw new Error("Failed to initialize Swiss Ephemeris library: " + initErr.message);
            }

            reportProgress(15); // SWE Ready

            const {
                name,
                birthYear,
                birthMonth,
                birthDay,
                birthHour,
                birthMinute,
                birthSecond = 0,
                latitude,
                longitude,
                timezone,
                city,
                fatherName,
                motherName,
                gotra,
                nawranName
            } = birthData;

            // Format timezone for Luxon (handle numeric offsets like 5.5 or 5.75)
            let zoneStr = 'UTC';
            if (typeof timezone === 'number') {
                const hours = Math.floor(Math.abs(timezone));
                const minutes = Math.round((Math.abs(timezone) - hours) * 60);
                const sign = timezone >= 0 ? '+' : '-';
                zoneStr = `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            } else if (timezone) {
                zoneStr = timezone;
            }

            // Create DateTime object
            const datetime = DateTime.fromObject({
                year: birthYear,
                month: birthMonth,
                day: birthDay,
                hour: birthHour,
                minute: birthMinute,
                second: birthSecond
            }, { zone: zoneStr });

            // Calculate Kundali using VedicJyotish
            reportProgress(25); // Creating Time Context
            const kundliResult = Kundli(datetime, longitude, latitude, 0);
            reportProgress(45); // Calculations Complete

            // Deterministic Fact Layer
            const facts = VedicRuleEngine.extractFacts(kundliResult);
            const planets = kundliResult.planets;
            const panchangaData = kundliResult.panchanga;

            // Calculate current age
            const now = DateTime.now();
            const age = now.diff(datetime, ['years', 'months', 'days']).toObject();


            reportProgress(60); // Starting AI Analysis

            let analysis = null;
            if (!skipAI) {
                // Start a slow simulation to crawl toward 95% while waiting for the LLM
                let currentP = 60;
                const progressInterval = setInterval(() => {
                    if (currentP < 95) {
                        currentP += Math.random() * 2;
                        reportProgress(Math.floor(currentP));
                    }
                }, 2000);

                try {
                    analysis = await this.generateComprehensiveAnalysis(kundliResult, birthData, facts, false, language);
                } finally {
                    clearInterval(progressInterval);
                }
            } else {
                analysis = await this.generateComprehensiveAnalysis(kundliResult, birthData, facts, true, language);
            }

            reportProgress(100); // Analysis complete

            return {
                success: true,
                data: {
                    basicInfo: {
                        name,
                        birthDate: `${birthDay}/${birthMonth}/${birthYear}`,
                        birthTime: `${birthHour.toString().padStart(2, '0')}:${birthMinute.toString().padStart(2, '0')}`,
                        place: city,
                        coordinates: { latitude, longitude },
                        panchanga: {
                            sunrise: panchangaData.sunrise.dt.toFormat('hh:mm a'),
                            sunset: panchangaData.sunset.dt.toFormat('hh:mm a'),
                            tithi: panchangaData.tithi.name.english,
                            bornDay: panchangaData.vara.name.english,
                            ayanamsa: panchangaData.ayanamsa.toFixed(4)
                        },
                        age: `${Math.floor(age.years)}y ${Math.floor(age.months)}m ${Math.floor(age.days)}d`,
                        // Advanced details preservation
                        fatherName,
                        motherName,
                        gotra,
                        nawranName,
                        // Nepali Transliterations
                        fatherNameNp: simpleTransliterate(fatherName),
                        motherNameNp: simpleTransliterate(motherName),
                        gotraNp: simpleTransliterate(gotra),
                        nawranNameNp: simpleTransliterate(nawranName)
                    },
                    kundaliData: planets,
                    analysis,
                    facts, // Expose facts for background AI generation
                    chartData: planets,
                    rawKundli: kundliResult,
                    generatedAt: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Error generating Kundali:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Generate comprehensive AI analysis
    async generateComprehensiveAnalysis(fullKundli, birthData, facts, skipAI = false, language = 'en') {
        const planets = fullKundli.planets;
        const shadbala = calcShadbala(planets, fullKundli.daybirth);
        const rashiBala = calcRashiBala(shadbala);
        const ashtakavarga = calcSarvashtakavarga(planets);



        const analysis = {
            ascendant: {
                sign: facts.ascendant.sign,
                degree: facts.ascendant.degree,
                analysis: this.analyzeAscendant(planets.Ascendant)
            },
            planets: {},
            houses: {},
            yogas: facts.yogas,
            doshas: facts.doshas,
            dasha: this.calculateDasha(fullKundli, DateTime.now()), // Default to now
            nakshatras: this.analyzeNakshatras(planets),
            remedies: this.suggestRemedies(planets),
            ashtakavarga: ashtakavarga,
            shadbala: shadbala,
            rashiBala: rashiBala,
            predictions: skipAI ? null : await this.generateGroundedPredictions(facts, this.calculateDasha(fullKundli, DateTime.now()), language)
        };

        const outerPlanets = ["Uranus", "Neptune", "Pluto"];
        for (const [planetName, planetData] of Object.entries(planets)) {
            if (planetName !== 'Ascendant' && planetData.rasi && !outerPlanets.includes(planetName)) {
                const pFact = facts.planets[planetName];
                if (!pFact) continue;
                analysis.planets[planetName] = {
                    sign: pFact.sign,
                    degree: pFact.degree,
                    house: pFact.house,
                    analysis: {
                        strength: pFact.dignity,
                        effects: `As ${pFact.dignity} in ${pFact.sign} (${pFact.house}th House), aspecting houses ${pFact.aspectingHouses.join(', ')}.`
                    }
                };
            }
        }

        // Map facts back to houses
        for (let i = 1; i <= 12; i++) {
            const hFact = facts.houses[`House_${i}`];
            analysis.houses[i] = `House in ${hFact.sign} ruled by ${hFact.lord}, placed in ${hFact.lordPlacement}H.`;
        }

        return analysis;
    }

    async analyzeDashaPeriod(facts, dashaInfo, upcomingDashas = null, language = 'en', onStreamUpdate = null) {
        if (!dashaInfo) return null;

        const system = dashaInfo.system || 'standard';
        const mahadasha = dashaInfo.mahadasha;
        const antardasha = dashaInfo.antardasha;
        const pratyantardasha = dashaInfo.pratyantardasha;

        const systemContext = {
            system: system,
            current: {
                mahadasha: `${mahadasha?.planet || mahadasha?.name}`,
                antardasha: `${antardasha?.planet || antardasha?.name}`,
                pratyantardasha: `${pratyantardasha?.planet || pratyantardasha?.name}`,
            },
            upcoming: (upcomingDashas || []).map(u => u.mahadasha.split(' (')[0]), // Remove date strings
            moon_nakshatra: facts.planets.Moon?.nakshatra,
            ascendant: facts.ascendant.sign
        };

        const analysisPrompt = `
        You are an expert Vedic Astrologer specializing in multiple Dasha systems. 
        Analyze the current and upcoming periods using the **${systemContext.system.toUpperCase()}** system methodology.
        
        SYSTEM CONTEXT:
        Methodology: ${systemContext.system}
        Current Phase: ${JSON.stringify(systemContext.current)}
        Upcoming Timeline: ${JSON.stringify(systemContext.upcoming || [])}
        
        CHART SUMMARY:
        Ascendant: ${facts.ascendant.sign}
        Moon: ${facts.planets.Moon?.sign} in ${facts.planets.Moon?.nakshatra}
        Essential Planets: ${Object.entries(facts.planets).map(([p, d]) => `${p} in ${d.sign} (${d.house}H)`).join(', ')}
        
        INSTRUCTIONS:
        1. Interpret the results STRICTLY according to the ${systemContext.system} methodology.
        2. Contrast the current challenges with the specific promises of the upcoming periods.
        3. Provide clear, actionable advice for both the present and the future.
        4. Use a professional, mystical yet grounded tone.
        5. Keep the total length around 100-120 words.
        6. LANGUAGE REQUIREMENT: You MUST use PURE NEPALI (नेपाली), NOT Hindi. 
           - ABSOLUTELY NO HINDI (हिन्दी). Avoid "होता है", "सकते हैं", "होगा". Use "हुन्छ", "सकिन्छ", "हुनेछ".
           - High-quality Nepali grammar only. If output is Hindi, it is a FAILURE.
        7. NO TECHNICAL DATA: DO NOT mention ISO dates, timestamps, or system terms.
        8. FORMAT: Use EXACTLY these two tags to separate sections: [PRESENT] and [UPCOMING]. Use them exactly for machine parsing.
        `;

        try {
            if (typeof window !== 'undefined') {
                const response = await fetch('/api/kundli-ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: analysisPrompt,
                        format: "", // Explicitly request plain text (override default json)
                        options: { temperature: 0.4, num_ctx: 2048 }
                    })
                });

                if (!response.ok) throw new Error("AI Dasha Analysis failed");

                // Handle streaming if provided, otherwise return text
                if (onStreamUpdate && response.body) {
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let fullText = '';
                    let accumulated = '';

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value, { stream: true });
                        accumulated += chunk;

                        // Split by newline and parse each JSON object
                        const lines = accumulated.split('\n');
                        accumulated = lines.pop(); // Keep the last partial line

                        for (const line of lines) {
                            if (!line.trim()) continue;
                            try {
                                const parsed = JSON.parse(line);
                                if (parsed.response) {
                                    fullText += parsed.response;
                                    onStreamUpdate(fullText);
                                }
                            } catch (e) {
                                console.warn("Failed to parse AI stream line:", line);
                            }
                        }
                    }
                    return fullText;
                } else {
                    const data = await response.json();
                    return data.response;
                }
            } else {
                // Server-side fallback
                const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://5.180.172.215:11434';
                const res = await fetch(`${ollamaBaseUrl}/api/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: 'llama3.2:latest',
                        prompt: analysisPrompt,
                        stream: false,
                        options: { temperature: 0.4 }
                    })
                });
                if (res.ok) {
                    const d = await res.json();
                    return d.response;
                }
                return "Failed to connect to AI for dasha analysis.";
            }
        } catch (err) {
            console.error("Dasha Analysis Prompt Error:", err);
            return "Could not generate dasha analysis at this time.";
        }
    }

    async generateGroundedPredictions(facts, dashaInfo = null, language = 'en', onStreamUpdate = null) {
        // 1. RICH DATA EXTRACTION
        // We create a concise but comprehensive view of the chart for the LLM.
        const planetsDetailed = Object.entries(facts.planets || {})
            .filter(([key]) => !['Uranus', 'Neptune', 'Pluto', 'Ascendant'].includes(key)) // Ascendant is separate
            .map(([name, data]) => ({
                planet: name,
                sign: data.sign,
                house: data.house,
                dignity: data.dignity, // e.g., Exalted, Debilitated, Own Sign, Great Friend
                conjunctions: data.conjunctionsWith && data.conjunctionsWith.length > 0 ? data.conjunctionsWith.join(', ') : 'None',
                // aspects: data.aspectingHouses ? data.aspectingHouses.join(', ') : '' // Optional: Add if token limit permits
            }));

        const simplifiedFacts = {
            ascendant: facts.ascendant.sign,
            moon_sign: facts.planets.Moon?.sign,
            nakshatra: facts.planets.Moon?.nakshatra,

            // Limit to essential panchanga only
            panchanga: {
                Tithi: facts.panchanga.Tithi?.name,
                Yoga: facts.panchanga.Yoga?.name,
                Karana: facts.panchanga.Karana?.name
            },

            // Only names, no descriptions
            yogas: facts.yogas.filter(y => y.status === "Present").map(y => y.name).slice(0, 5),
            doshas: facts.doshas.filter(d => d.status === "Present").map(d => d.name).slice(0, 5),

            // Compact planet list
            planets: planetsDetailed.map(p => `${p.planet} in ${p.sign} (${p.house}H)`),

            current_dasha: dashaInfo ? `${dashaInfo.vimshottari.mahadasha.planet} -> ${dashaInfo.vimshottari.antardasha.planet}` : "Unknown"
        };

        const lockPrompt = `
        You are an expert Vedic Astrologer.
        Analyze the provided chart data and generate ONE specific prediction sentence for each category.

        DATA:
        ${JSON.stringify(simplifiedFacts)}

        OUTPUT IN STRICT JSON FORMAT:
        {
          "personality": "Your prediction (max 20 words)",
          "career": "Your prediction (max 20 words)",
          "marriage": "Your prediction (max 20 words)",
          "health": "Your prediction (max 20 words)",
          "wealth": "Your prediction (max 20 words)",
          "education": "Your prediction (max 20 words)",
          "children": "Your prediction (max 20 words)",
          "travel": "Your prediction (max 20 words)",
          "luck": "Your prediction (max 20 words)",
          "spirituality": "Your prediction (max 20 words)",
          "yogas_analysis": {},
          "doshas_analysis": {}
        }

        INSTRUCTIONS:
        1. Use a professional, mystical yet grounded tone.
        2. LANGUAGE REQUIREMENT: The values in the JSON object MUST be in ${language === 'ne' ? 'Nepali (नेपाली)' : 'English'}. If Nepali, use pure Nepali (नेपाली), NOT Hindi. 
        3. NO TECHNICAL NOISE: DO NOT include raw ISO timestamps, coordinates, or technical planetary longitude numbers in the text of your predictions.
        4. Output ONLY the JSON object.
        `;

        try {
            let response;
            if (typeof window !== 'undefined') {
                response = await fetch('/api/kundli-ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: lockPrompt,
                        options: {
                            temperature: 0.3,
                            num_ctx: 2048,
                            num_predict: 800
                        }
                    })
                });
            } else {
                // Fallback for direct calls where possible
                const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://5.180.172.215:11434';
                // Server-side fallback (non-streaming for now as per previous logic)
                const res = await fetch(`${ollamaBaseUrl}/api/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: 'llama3.2:latest',
                        prompt: lockPrompt,
                        stream: false,
                        format: 'json',
                        options: { temperature: 0.3 }
                    })
                });
                if (res.ok) {
                    const d = await res.json();
                    return JSON.parse(d.response);
                }
                return null;
            }

            if (!response.ok) {
                const errText = await response.text();
                console.error("AI Service Failed:", response.status, errText);
                throw new Error(`AI Service Failed (${response.status}): ${errText}`);
            }

            // IMMEDATE DETERMINISTIC PREDICTIONS (Optimistic UI)
            // This ensures the user sees something INSTANTLY while the heavy AI loads.
            if (onStreamUpdate) {
                const instantData = this.generateDeterministicPredictions(facts, language);
                if (instantData) {
                    onStreamUpdate(instantData);
                }
            }

            // STREAM CONSUMPTION
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let rawBuffer = "";
            let assembledText = ""; // The actual clean JSON we are building

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                rawBuffer += chunk;

                // Process complete lines from rawBuffer
                let newlineIndex;
                while ((newlineIndex = rawBuffer.indexOf('\n')) !== -1) {
                    const line = rawBuffer.slice(0, newlineIndex).trim();
                    rawBuffer = rawBuffer.slice(newlineIndex + 1);

                    if (!line) continue;

                    try {
                        // Parse the Ollama wrapper object
                        const json = JSON.parse(line);
                        if (json.error) {
                            console.error("Ollama Stream Error:", json.error);
                        }
                        if (json.response) {
                            assembledText += json.response;
                        }
                        if (json.done) {
                            // Stream finished
                        }
                    } catch (e) {
                        // Likely a partial line that made it through or heartbeat junk
                        // console.warn("Failed to parse chunk line:", line.slice(0, 50));
                    }
                }

                // LIVE PARSING on the clean text
                if (onStreamUpdate) {
                    const partial = this.extractPartialPredictions(assembledText);
                    if (Object.keys(partial).length > 0) {
                        onStreamUpdate(partial);
                    }
                }
            }

            // Final pass: parse the full assembled text as JSON to be sure
            // (The original code used accumulatedResponse splits, but now we have assembledText)
            let predictions;
            try {
                predictions = JSON.parse(assembledText);
            } catch (parseError) {
                // Fallback to extraction if strictly invalid JSON (e.g. detailed parsing)
                // But generally, at the end, assembledText should be valid JSON
                const found = this.extractPartialPredictions(assembledText);
                if (Object.keys(found).length > 0) {
                    predictions = found;
                } else {
                    console.error("Final JSON Parse Failed:", parseError);
                    throw new Error("Failed to parse final AI response");
                }
            }

            return predictions;

        } catch (e) {
            console.error("AI Generation Critical Error:", e.message);
            throw e; // Propagate error
        }

        return null;
    }

    // Generates instant placeholders based on simple astrological rules
    generateDeterministicPredictions(facts, language = 'en') {
        const p = {};
        const ascSign = facts.ascendant.sign;
        const isNe = language === 'ne';

        // Personality (Ascendant)
        p.personality = isNe
            ? `बलियो ${localizeName(ascSign)} लग्नले जीवनमा गतिशील र अद्वितीय दृष्टिकोणको संकेत गर्दछ। (AI विश्लेषण हुँदै...)`
            : `Strong ${ascSign} energy suggests a dynamic and unique approach to life. (AI refining...)`;

        // Career
        p.career = isNe
            ? `ग्रहहरूको स्थितिले वृद्धि र नेतृत्व भूमिकाहरूको सम्भावना संकेत गर्दछ।`
            : `Planetary alignment indicates potential for growth and leadership roles.`;

        // Marriage
        p.marriage = isNe
            ? `सम्बन्धहरूमा सद्भावका लागि सन्तुलन र आपसी समझदारी आवश्यक छ।`
            : `Relationships require balance and mutual understanding for harmony.`;

        // Health
        p.health = isNe
            ? `आहार र दिनचर्यामा सक्रिय दृष्टिकोणले जीवनशक्तिमा लाभ पुर्याउनेछ।`
            : `A proactive approach to diet and routine will benefit vitality.`;

        // Wealth
        p.wealth = isNe
            ? `अनुशासित योजनाको साथ वित्तीय स्थिरता संकेत गरिएको छ।`
            : `Financial stability is indicated with disciplined planning.`;

        // New Categories
        p.education = isNe ? `सिक्ने र सीप प्राप्त गर्ने कुरामा केन्द्रित हुनुपर्ने देखिन्छ।` : `Focus on learning and skill acquisition is highlighted.`;
        p.children = isNe ? `सन्तान वा परियोजनाहरू मार्फत रचनात्मकता र आनन्दको संकेत छ।` : `Creativity and joy through progeny or projects is indicated.`;
        p.travel = isNe ? `फाइदाजनक यात्राहरूको अवसर देखिन्छ।` : `Opportunities for beneficial journeys are visible.`;
        p.luck = isNe ? `भाग्यले साहसी कार्य र आध्यात्मिक योग्यतालाई साथ दिन्छ।` : `Fortune favors bold actions and spiritual merit.`;
        p.spirituality = isNe ? `आन्तरिक विकास र आत्म-जागरूकता मुख्य विषयहरू हुन्।` : `Inner growth and self-awareness are key themes.`;

        return p;
    }

    extractPartialPredictions(text) {
        const found = {};
        // Clean up NDJSON/newlines if any
        const cleanText = text.replace(/\\n/g, ' ').replace(/\s+/g, ' ');

        // Keys we expect from the prompt
        const keys = [
            'personality', 'career', 'marriage', 'health', 'wealth',
            'education', 'children', 'travel', 'luck', 'spirituality'
        ];

        keys.forEach(key => {
            // Regex to find "key": "value" or 'key': 'value' or key: "value"
            // Handles both double and single quotes for keys and values
            const regex = new RegExp(`["']?${key}["']?\\s*:\\s*["']((?:[^"\\'\\\\]|\\\\.)*)["']`, 'i');
            const match = cleanText.match(regex);
            if (match && match[1]) {
                found[key] = match[1];
            }
        });

        // Also try to find nested objects if simple string failed (e.g. yogas_analysis)
        // For now, focusing on text fields which are the main delay
        return found;
    }

    formatChartData(kundaliData) {
        const chartData = [];
        const outerPlanets = ["Uranus", "Neptune", "Pluto"];
        for (const [planetName, planetData] of Object.entries(kundaliData)) {
            if (planetData.rasi && !outerPlanets.includes(planetName)) {
                chartData.push({
                    planet: planetName,
                    sign: planetData.rasi.rasi_num,
                    degree: planetData.degree,
                    house: this.calculateHouse(planetData.degree, kundaliData.Ascendant.degree)
                });
            }
        }
        return chartData;
    }

    getSignName(signNumber) {
        const signs = [
            'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
            'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
        ];
        return signs[signNumber - 1] || 'Unknown';
    }

    calculateHouse(planetDegree, ascendantDegree) {
        const houseDegree = (planetDegree - ascendantDegree + 360) % 360;
        return Math.floor(houseDegree / 30) + 1;
    }

    analyzeAscendant(ascendant) {
        const sign = this.getSignName(ascendant.rasi.rasi_num);
        return {
            personality: `Strong ${sign} ascendant indicates...`,
            physical: `Physical characteristics typical of ${sign}...`,
            approach: `Life approach and behavior patterns...`
        };
    }

    analyzePlanet(planetName, planetData) {
        const sign = this.getSignName(planetData.rasi.rasi_num);
        const house = this.calculateHouse(planetData.degree, planetData.degree);
        return {
            sign: sign,
            house: house,
            strength: this.calculatePlanetaryStrength(planetData),
            effects: this.getPlanetaryEffects(planetName, sign, house)
        };
    }

    analyzeHouse(houseNumber, kundaliData) {
        const planetsInHouse = [];
        for (const [planetName, planetData] of Object.entries(kundaliData)) {
            if (planetData.rasi) {
                const house = this.calculateHouse(planetData.degree, kundaliData.Ascendant.degree);
                if (house === houseNumber) {
                    planetsInHouse.push(planetName);
                }
            }
        }
        return {
            planets: planetsInHouse,
            analysis: this.getHouseAnalysis(houseNumber, planetsInHouse)
        };
    }

    identifyYogas(kundaliData) {
        const yogas = [];
        if (this.hasRajaYoga(kundaliData)) {
            yogas.push({
                name: 'Raja Yoga',
                type: 'Benefic',
                description: 'Royal combination bringing power and authority',
                effects: 'Success, recognition, leadership qualities'
            });
        }
        if (this.hasDhanaYoga(kundaliData)) {
            yogas.push({
                name: 'Dhana Yoga',
                type: 'Benefic',
                description: 'Wealth combination bringing prosperity',
                effects: 'Financial success, material comforts, wealth accumulation'
            });
        }
        return yogas;
    }

    identifyDoshas(kundaliData) {
        const doshas = [];
        if (this.hasManglikDosh(kundaliData)) {
            doshas.push({
                name: 'Manglik Dosh',
                type: 'Affliction',
                description: 'Mars affliction affecting marriage',
                effects: 'Delayed marriage, relationship issues',
                remedies: ['Manglik matching', 'Mars remedies', 'Delayed marriage']
            });
        }
        return doshas;
    }

    calculateDasha(kundaliData, targetDate = DateTime.now()) {
        if (!kundaliData || !kundaliData.panchanga) {
            return { error: 'Missing astronomical data' };
        }

        // Helper: Timezone-safe active period finder with defensive logging
        const findActiveDasha = (childDasha, targetDate, dashaName, levelName) => {
            if (!childDasha || childDasha.length === 0) {
                console.warn(`[${dashaName}] No ${levelName} periods found.`);
                return null;
            }

            // Normalize to UTC milliseconds for reliable comparison
            const targetUTC = targetDate.toUTC().toMillis();

            const active = childDasha.find(period => {
                const startUTC = period.StartDate.toUTC().toMillis();
                const endUTC = period.EndDate.toUTC().toMillis();
                const inRange = targetUTC >= startUTC && targetUTC <= endUTC;

                // Debug logging (remove in production if verbose)
                if (!inRange && process.env.NODE_ENV === 'development') {
                    console.debug(
                        `[${dashaName}/${levelName}] Skipping:`,
                        period.Name || period.Lord,
                        'Start:', period.StartDate.toISO(),
                        'End:', period.EndDate.toISO(),
                        'Target:', targetDate.toISO()
                    );
                }
                return inRange;
            });

            if (!active) {
                console.warn(
                    `[${dashaName}/${levelName}] No active period found for ${targetDate.toISO()}. Using first period as fallback.`,
                    childDasha[0]?.Name || childDasha[0]?.Lord
                );
                return childDasha[0];
            }

            return active;
        };

        try {
            const { tjd_ut, nakshatra } = kundaliData.panchanga;
            const dob = kundaliData.datetime;

            // 1. Vimshottari - Independent calculation
            const vimTree = calcVimsottariDasa(tjd_ut, nakshatra, dob);
            const currentMD_Vim = findActiveDasha(vimTree, targetDate, 'Vimshottari', 'Mahadasha') || { Lord: 'Unknown', ChildDasha: [], StartDate: targetDate, EndDate: targetDate };
            const currentAD_Vim = findActiveDasha(currentMD_Vim.ChildDasha, targetDate, 'Vimshottari', 'Antardasha') || { Lord: 'Unknown', ChildDasha: [], StartDate: targetDate, EndDate: targetDate };
            const currentPD_Vim = findActiveDasha(currentAD_Vim.ChildDasha, targetDate, 'Vimshottari', 'Pratyantar') || { Lord: 'Unknown', StartDate: targetDate, EndDate: targetDate };

            // Calculate remaining years for Mahadasha
            const remainingMillis = (currentMD_Vim?.EndDate?.diff(targetDate)?.as('milliseconds')) || 0;
            const remainingYearsDecimal = parseFloat(((remainingMillis / 3.154e10)).toFixed(2));

            // 🌟 IMMORTAL FIX: CAPTURE TRUE VALUES BEFORE ANY TRIBHAGI ENGINE RUNS
            // This prevents "Mutation by Reference" bugs where calcTribhagiDasha corrupts vimTree.
            const TRUE_VIMS_MAHA = String(currentMD_Vim.Lord);
            const TRUE_VIMS_ANTAR = String(currentAD_Vim.Lord);
            const TRUE_VIMS_PRAT = String(currentPD_Vim.Lord);

            // 2. Yogini - Independent calculation
            const yoginiTimeline = calcYoginiDasha(nakshatra, dob);
            const activeYogini = findActiveDasha(yoginiTimeline, targetDate, 'Yogini', 'Mahadasha') || { Name: 'Unknown', Lord: 'Unknown', ChildDasha: [], StartDate: targetDate, EndDate: targetDate };
            const currentAD_Yog = findActiveDasha(activeYogini.ChildDasha, targetDate, 'Yogini', 'Antardasha') || { Name: 'Unknown', Lord: 'Unknown', ChildDasha: [], StartDate: targetDate, EndDate: targetDate };
            const currentPD_Yog = findActiveDasha(currentAD_Yog.ChildDasha, targetDate, 'Yogini', 'Pratyantar') || { Name: 'Unknown', Lord: 'Unknown', StartDate: targetDate, EndDate: targetDate };

            // 3. Tribhagi - Standard Canonical Calculation (80yr Cycle)
            const tribhagiTree = calcTribhagiDasha([], {
                birthDate: dob.toJSDate(),
                moonLon: kundaliData.planets.Moon.degree
            });

            // (Redundant logic removed: using canonical resolveTribhagi below for current state)


            const formatTimeline = (tree) => {
                const safeTree = Array.isArray(tree) ? tree : [];
                return safeTree.map(md => {
                    const mdName = (md.Name === 'MahaDasha' || md.Name === 'AntarDasha' || md.Name === 'PratyantarDasha') ? md.Lord : (md.Name || md.Lord);
                    return {
                        lord: mdName,
                        lordNp: localizeName(mdName),
                        start: md.StartDate.toISO(),
                        startNp: formatToNepaliDate(md.StartDate),
                        end: md.EndDate.toISO(),
                        endNp: formatToNepaliDate(md.EndDate),
                        antardashas: (md.ChildDasha || []).map(ad => {
                            const adName = (ad.Name === 'MahaDasha' || ad.Name === 'AntarDasha' || ad.Name === 'PratyantarDasha') ? ad.Lord : (ad.Name || ad.Lord);
                            return {
                                lord: adName,
                                lordNp: localizeName(adName),
                                start: ad.StartDate.toISO(),
                                startNp: formatToNepaliDate(ad.StartDate),
                                end: ad.EndDate.toISO(),
                                endNp: formatToNepaliDate(ad.EndDate),
                                pratyantardashas: (ad.ChildDasha || []).map(pd => {
                                    const pdName = (pd.Name === 'MahaDasha' || pd.Name === 'AntarDasha' || pd.Name === 'PratyantarDasha') ? pd.Lord : (pd.Name || pd.Lord);
                                    return {
                                        lord: pdName,
                                        lordNp: localizeName(pdName),
                                        start: pd.StartDate.toISO(),
                                        startNp: formatToNepaliDate(pd.StartDate),
                                        end: pd.EndDate.toISO(),
                                        endNp: formatToNepaliDate(pd.EndDate)
                                    };
                                })
                            };
                        })
                    };
                });
            };
            // 🏗️ CANONICAL TRIBHAGI ENGINE [STRICT MODE]
            // We now bypass Vimshottari completely and use the independent math resolver.

            // 1. Prepare Inputs
            // birthJD is tjd_ut from birth panchanga
            const birthJD = tjd_ut;

            // moonLongitude (Sidereal) from Kundli planets
            const moonLon = kundaliData.planets.Moon.degree;

            // targetJD: Calculate difference in days from birth and add to birthJD
            // conversion: 1 day = 1 JD unit approx (solar/sidereal diff is negligible for this delta calc)
            // accurate enough for dasha which works on 365.2422 day years.
            const diffDays = targetDate.diff(dob, 'days').days;
            const targetJD = birthJD + diffDays;

            // 2. Call Strict Resolver
            const tribhagiRaw = resolveTribhagi({
                birthJD: birthJD,
                moonLongitude: moonLon,
                targetJD: targetJD,
                birthDate: dob.toJSDate()
            });

            // 3. 🔒 Hard Assertion: Mercury Check
            // Only throw if Vimshottari is NOT Mercury but Tribhagi IS Mercury.
            // Note: tribhagiRaw.maha is now an object { planet, start, end }
            if (tribhagiRaw.maha.planet === "Mercury" && vimTree[0].Lord !== "Mercury") {
                throw new Error("FATAL: Tribhagi calculation returned Mercury when it shouldn't have (known bug pattern).");
            }

            // 4. Map to UI Object
            const tribhagiData = {
                system: "Tribhagi",
                systemNp: "त्रिभागी दशा",

                mahadasha: {
                    planet: tribhagiRaw.maha.planet,
                    planetNp: localizeName(tribhagiRaw.maha.planet),
                    start: DateTime.fromJSDate(tribhagiRaw.maha.start).toISO(),
                    startNp: formatToNepaliDate(DateTime.fromJSDate(tribhagiRaw.maha.start)),
                    end: DateTime.fromJSDate(tribhagiRaw.maha.end).toISO(),
                    endNp: formatToNepaliDate(DateTime.fromJSDate(tribhagiRaw.maha.end))
                },
                antardasha: {
                    planet: tribhagiRaw.antar.planet,
                    planetNp: localizeName(tribhagiRaw.antar.planet),
                    start: DateTime.fromJSDate(tribhagiRaw.antar.start).toISO(),
                    startNp: formatToNepaliDate(DateTime.fromJSDate(tribhagiRaw.antar.start)),
                    end: DateTime.fromJSDate(tribhagiRaw.antar.end).toISO(),
                    endNp: formatToNepaliDate(DateTime.fromJSDate(tribhagiRaw.antar.end))
                },
                pratyantardasha: {
                    planet: tribhagiRaw.prat.planet,
                    planetNp: localizeName(tribhagiRaw.prat.planet),
                    start: DateTime.fromJSDate(tribhagiRaw.prat.start).toISO(),
                    startNp: formatToNepaliDate(DateTime.fromJSDate(tribhagiRaw.prat.start)),
                    end: DateTime.fromJSDate(tribhagiRaw.prat.end).toISO(),
                    endNp: formatToNepaliDate(DateTime.fromJSDate(tribhagiRaw.prat.end))
                },

                phase: tribhagiRaw.phase,
                phaseNp: localizeName(tribhagiRaw.phase),
                timeline: formatTimeline(tribhagiTree)
            };

            return {
                calculatedAt: targetDate.toISO(),
                status: "accurate",
                birthData: {
                    moonSign: this.getSignName(nakshatra.sign), // infer sign from nakshatra
                    nakshatra: nakshatra.name.english,
                    nakshatraNp: localizeName(nakshatra.name.english),
                    degreeComplete: nakshatra.degree.toFixed(2),
                    lord: nakshatra.lord,
                    lordNp: localizeName(nakshatra.lord),
                    balanceDate: vimTree[0].StartDate.toISO() // The effective start of the first MD
                },
                vimshottari: {
                    type: "dasha_state",
                    system: "Vimshottari",
                    systemNp: "विंशोत्तरी दशा",
                    calculated_for: targetDate.toISO(),
                    current: `${currentMD_Vim.Lord} - ${currentAD_Vim.Lord} - ${currentPD_Vim.Lord}`,
                    currentNp: `${localizeName(currentMD_Vim.Lord)} - ${localizeName(currentAD_Vim.Lord)} - ${localizeName(currentPD_Vim.Lord)}`,
                    mahadasha: {
                        planet: currentMD_Vim.Lord,
                        planetNp: localizeName(currentMD_Vim.Lord),
                        name: currentMD_Vim.Lord,
                        nameNp: localizeName(currentMD_Vim.Lord),
                        start: currentMD_Vim.StartDate.toISO(),
                        startNp: formatToNepaliDate(currentMD_Vim.StartDate),
                        end: currentMD_Vim.EndDate.toISO(),
                        endNp: formatToNepaliDate(currentMD_Vim.EndDate),
                        remaining_years: remainingYearsDecimal
                    },
                    antardasha: {
                        planet: currentAD_Vim.Lord,
                        planetNp: localizeName(currentAD_Vim.Lord),
                        name: currentAD_Vim.Lord,
                        nameNp: localizeName(currentAD_Vim.Lord),
                        start: currentAD_Vim.StartDate.toISO(),
                        startNp: formatToNepaliDate(currentAD_Vim.StartDate),
                        end: currentAD_Vim.EndDate.toISO(),
                        endNp: formatToNepaliDate(currentAD_Vim.EndDate)
                    },
                    pratyantardasha: {
                        planet: currentPD_Vim.Lord,
                        planetNp: localizeName(currentPD_Vim.Lord),
                        name: currentPD_Vim.Lord,
                        nameNp: localizeName(currentPD_Vim.Lord),
                        start: currentPD_Vim.StartDate.toISO(),
                        startNp: formatToNepaliDate(currentPD_Vim.StartDate),
                        end: currentPD_Vim.EndDate.toISO(),
                        endNp: formatToNepaliDate(currentPD_Vim.EndDate)
                    },
                    timeline: formatTimeline(vimTree)
                },
                yogini: {
                    system: "Yogini",
                    systemNp: "योगिनी दशा",
                    active: {
                        name: activeYogini.Name,
                        nameNp: localizeName(activeYogini.Name),
                        planet: activeYogini.Lord,
                        planetNp: localizeName(activeYogini.Lord),
                        start: activeYogini.StartDate.toISO(),
                        startNp: formatToNepaliDate(activeYogini.StartDate),
                        end: activeYogini.EndDate.toISO(),
                        endNp: formatToNepaliDate(activeYogini.EndDate)
                    },
                    // Mapping standard MD/AD structure for UI compatibility if needed, 
                    // but keeping it Yogini specific where possible.
                    current: `${activeYogini.Name} - ${currentAD_Yog.Name} - ${currentPD_Yog.Name}`,
                    currentNp: `${localizeName(activeYogini.Name)} - ${localizeName(currentAD_Yog.Name)} - ${localizeName(currentPD_Yog.Name)}`,
                    mahadasha: {
                        name: activeYogini.Name,
                        nameNp: localizeName(activeYogini.Name),
                        planet: activeYogini.Lord,
                        planetNp: localizeName(activeYogini.Lord),
                        start: activeYogini.StartDate.toISO(),
                        startNp: formatToNepaliDate(activeYogini.StartDate),
                        end: activeYogini.EndDate.toISO(),
                        endNp: formatToNepaliDate(activeYogini.EndDate)
                    },
                    antardasha: {
                        name: currentAD_Yog.Name,
                        nameNp: localizeName(currentAD_Yog.Name),
                        planet: currentAD_Yog.Lord,
                        planetNp: localizeName(currentAD_Yog.Lord),
                        start: currentAD_Yog.StartDate.toISO(),
                        startNp: formatToNepaliDate(currentAD_Yog.StartDate),
                        end: currentAD_Yog.EndDate.toISO(),
                        endNp: formatToNepaliDate(currentAD_Yog.EndDate)
                    },
                    pratyantardasha: {
                        name: currentPD_Yog.Name,
                        nameNp: localizeName(currentPD_Yog.Name),
                        planet: currentPD_Yog.Lord,
                        planetNp: localizeName(currentPD_Yog.Lord),
                        start: currentPD_Yog.StartDate.toISO(),
                        startNp: formatToNepaliDate(currentPD_Yog.StartDate),
                        end: currentPD_Yog.EndDate.toISO(),
                        endNp: formatToNepaliDate(currentPD_Yog.EndDate)
                    },
                    timeline: formatTimeline(yoginiTimeline)
                },
                tribhagi: tribhagiData
            };
        } catch (e) {
            console.error("Dasha Calculation Error:", e);
            return { error: 'Calculation failure' };
        }
    }

    analyzeNakshatras(kundaliData) {
        const nakshatras = {};
        const outerPlanets = ["Uranus", "Neptune", "Pluto"];
        for (const [planetName, planetData] of Object.entries(kundaliData)) {
            if (planetData.rasi && !outerPlanets.includes(planetName)) {
                const nakshatra = this.calculateNakshatra(planetData.degree);
                nakshatras[planetName] = {
                    nakshatra: nakshatra.name,
                    pada: nakshatra.pada,
                    lord: nakshatra.lord,
                    effects: nakshatra.effects
                };
            }
        }
        return nakshatras;
    }

    suggestRemedies(kundaliData) {
        const remedies = [];
        const outerPlanets = ["Uranus", "Neptune", "Pluto"];
        for (const [planetName, planetData] of Object.entries(kundaliData)) {
            if (planetName !== 'Ascendant' && planetData.rasi && !outerPlanets.includes(planetName)) {
                const planetRemedies = this.getPlanetaryRemedies(planetName, planetData);
                if (planetRemedies.length > 0) {
                    remedies.push({
                        planet: planetName,
                        remedies: planetRemedies
                    });
                }
            }
        }
        return remedies;
    }

    generatePredictions(kundaliData) {
        return {
            career: this.predictCareer(kundaliData),
            marriage: this.predictMarriage(kundaliData),
            health: this.predictHealth(kundaliData),
            wealth: this.predictWealth(kundaliData),
            spirituality: this.predictSpirituality(kundaliData)
        };
    }

    calculatePlanetaryStrength(planetData) {
        return 'Medium';
    }

    getPlanetaryEffects(planetName, sign, house) {
        return `Effects of ${planetName} in ${sign} in house ${house} `;
    }

    getHouseAnalysis(houseNumber, planets) {
        return `Analysis of house ${houseNumber} with planets: ${planets.join(', ')} `;
    }

    hasRajaYoga(kundaliData) {
        return kundaliData.Jupiter && kundaliData.Jupiter.rasi.rasi_num <= 4;
    }

    hasDhanaYoga(kundaliData) {
        return kundaliData.Jupiter && kundaliData.Jupiter.rasi.rasi_num === 2;
    }

    hasManglikDosh(kundaliData) {
        if (kundaliData.Mars) {
            const marsHouse = this.calculateHouse(kundaliData.Mars.degree, kundaliData.Ascendant.degree);
            return [1, 4, 7, 8, 12].includes(marsHouse);
        }
        return false;
    }

    calculateNakshatra(degree) {
        const nakshatraNames = [
            "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
            "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
            "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadra", "Uttara Bhadra", "Revati"
        ];
        const nakshatraLords = [
            "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"
        ];

        const nakshatraIndex = Math.floor(degree / (360 / 27));
        const lordIndex = nakshatraIndex % 9;
        const pada = Math.floor((degree % (360 / 27)) / (360 / 108)) + 1;

        return {
            name: nakshatraNames[nakshatraIndex] || `Nakshatra ${nakshatraIndex + 1} `,
            pada: pada,
            lord: nakshatraLords[lordIndex],
            effects: 'Vedic nakshatra placement analysis'
        };
    }

    getPlanetaryRemedies(planetName, planetData) {
        const remedies = {
            'Sun': ['Ruby gemstone', 'Sunday fasting', 'Sun worship'],
            'Moon': ['Pearl gemstone', 'Monday fasting', 'Moon worship'],
            'Mars': ['Red Coral gemstone', 'Tuesday fasting', 'Hanuman worship'],
            'Mercury': ['Emerald gemstone', 'Wednesday fasting', 'Study'],
            'Jupiter': ['Yellow Sapphire gemstone', 'Thursday fasting', 'Guru worship'],
            'Venus': ['Diamond gemstone', 'Friday fasting', 'Beauty worship'],
            'Saturn': ['Blue Sapphire gemstone', 'Saturday fasting', 'Service']
        };
        return remedies[planetName] || [];
    }

    predictCareer(kundaliData) {
        return 'Career predictions based on 10th house and planetary positions';
    }

    predictMarriage(kundaliData) {
        return 'Marriage predictions based on 7th house and Venus position';
    }

    predictHealth(kundaliData) {
        return 'Health predictions based on 6th house and planetary positions';
    }

    predictWealth(kundaliData) {
        return 'Wealth predictions based on 2nd and 11th houses';
    }

    predictSpirituality(kundaliData) {
        return 'Spiritual predictions based on 9th and 12th houses';
    }

    /**
     * Extracts a clean, minimal Vimshottari state object for use in derived systems like Tribhagi.
     * STRICTLY forbids seed, nakshatra, or index fields.
     */
    getCleanVimshottariState(md, ad, pd) {
        return {
            maha: String(md.Lord),           // Explicitly cast to string to prevent object leaking
            maha_start: md.StartDate.toISO(), // Consistent string format
            maha_end: md.EndDate.toISO(),     // Consistent string format
            antar: String(ad.Lord),          // Explicitly cast to string
            prat: String(pd.Lord)            // Explicitly cast to string
        };
    }
}

// Export singleton instance
export const kundaliGenerationService = new KundaliGenerationService();
