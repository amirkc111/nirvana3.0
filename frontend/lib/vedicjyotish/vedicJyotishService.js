// VedicJyotish Service Integration
// This service integrates the VedicJyotish system with our Next.js app

import { DateTime } from 'luxon';

// Import the VedicJyotish Kundli service
// Note: We'll need to adapt this for our Next.js environment
let swe = null;
let Kundli = null;

// Initialize the VedicJyotish system
export async function initializeVedicJyotish() {
    try {
        // Import sweph-wasm for Swiss Ephemeris calculations
        const swephWasm = await import('sweph-wasm');
        swe = swephWasm.default;

        // Initialize the Swiss Ephemeris
        if (!swe.is_init()) {
            await swe.init();
        }

        console.log('✅ VedicJyotish system initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize VedicJyotish system:', error);
        return false;
    }
}

// Calculate Kundli using VedicJyotish system
export async function calculateVedicKundli(birthData) {
    try {
        // Ensure VedicJyotish is initialized
        if (!swe) {
            const initialized = await initializeVedicJyotish();
            if (!initialized) {
                throw new Error('Failed to initialize VedicJyotish system');
            }
        }

        // Create DateTime object from birth data
        const datetime = DateTime.fromObject({
            year: birthData.birthYear,
            month: birthData.birthMonth,
            day: birthData.birthDay,
            hour: birthData.birthHour,
            minute: birthData.birthMinute,
            zone: birthData.timezoneName,
        });

        const longitude = birthData.longitude;
        const latitude = birthData.latitude;
        const altitude = 0; // Assuming sea level

        // Swiss Ephemeris calculations
        const IFLAGS = swe.SEFLG_SWIEPH | swe.SEFLG_SPEED | swe.SEFLG_SIDEREAL;

        // Set sidereal mode (Lahiri Ayanamsa)
        swe.swe_set_sid_mode(swe.SE_SIDM_LAHIRI, 0, 0);

        // Set location
        swe.swe_set_topo(longitude, latitude, altitude);

        // Convert to Julian Day
        const utc_dt = datetime.toUTC();
        const tjd_ut = swe.swe_utc_to_jd(
            utc_dt.year,
            utc_dt.month,
            utc_dt.day,
            utc_dt.hour,
            utc_dt.minute,
            utc_dt.second,
            swe.SE_GREG_CAL
        )[1];

        // Calculate houses (Ascendant)
        const { ascmc } = swe.swe_houses(tjd_ut, latitude, longitude, "P");

        // Calculate planetary positions
        const planets = {};

        // Add Ascendant
        planets.Ascendant = {
            name: "Ascendant",
            degree: ascmc[0],
            rasi: Math.floor(ascmc[0] / 30) + 1,
            house: Math.floor(ascmc[0] / 30) + 1
        };

        // Planet IDs for Swiss Ephemeris
        const PLANET_IDS = {
            "Sun": swe.SE_SUN,
            "Moon": swe.SE_MOON,
            "Mars": swe.SE_MARS,
            "Mercury": swe.SE_MERCURY,
            "Jupiter": swe.SE_JUPITER,
            "Venus": swe.SE_VENUS,
            "Saturn": swe.SE_SATURN,
            "Rahu": swe.SE_TRUE_NODE
        };

        // Calculate planetary positions
        Object.entries(PLANET_IDS).forEach(([planetName, planetId]) => {
            const coords = swe.swe_calc_ut(tjd_ut, planetId, IFLAGS);
            const longitude = coords[0];
            const house = Math.floor(longitude / 30) + 1;

            planets[planetName] = {
                name: planetName,
                degree: longitude,
                rasi: house,
                house: house
            };

            // Calculate Ketu (Rahu + 180°)
            if (planetName === "Rahu") {
                const ketuLongitude = (longitude + 180) % 360;
                const ketuHouse = Math.floor(ketuLongitude / 30) + 1;

                planets.Ketu = {
                    name: "Ketu",
                    degree: ketuLongitude,
                    rasi: ketuHouse,
                    house: ketuHouse
                };
            }
        });

        // Calculate Upagrahas (Sub-planets)
        planets.Dhuma = {
            name: "Dhuma",
            degree: (planets.Sun.degree + 133.33) % 360,
            rasi: Math.floor(((planets.Sun.degree + 133.33) % 360) / 30) + 1,
            house: Math.floor(((planets.Sun.degree + 133.33) % 360) / 30) + 1
        };

        planets.Vyatipata = {
            name: "Vyatipata",
            degree: (360 - planets.Dhuma.degree) % 360,
            rasi: Math.floor(((360 - planets.Dhuma.degree) % 360) / 30) + 1,
            house: Math.floor(((360 - planets.Dhuma.degree) % 360) / 30) + 1
        };

        planets.Parivesha = {
            name: "Parivesha",
            degree: (planets.Vyatipata.degree + 180) % 360,
            rasi: Math.floor(((planets.Vyatipata.degree + 180) % 360) / 30) + 1,
            house: Math.floor(((planets.Vyatipata.degree + 180) % 360) / 30) + 1
        };

        planets.Chapa = {
            name: "Chapa",
            degree: (360 - planets.Parivesha.degree) % 360,
            rasi: Math.floor(((360 - planets.Parivesha.degree) % 360) / 30) + 1,
            house: Math.floor(((360 - planets.Parivesha.degree) % 360) / 30) + 1
        };

        planets.Upaketu = {
            name: "Upaketu",
            degree: (planets.Chapa.degree + 16.67) % 360,
            rasi: Math.floor(((planets.Chapa.degree + 16.67) % 360) / 30) + 1,
            house: Math.floor(((planets.Chapa.degree + 16.67) % 360) / 30) + 1
        };

        // Calculate Gulika and Yamaghantaka
        const gulikaTime = (planets.Saturn.degree + 93.33) % 360;
        planets.Gulika = {
            name: "Gulika",
            degree: gulikaTime,
            rasi: Math.floor(gulikaTime / 30) + 1,
            house: Math.floor(gulikaTime / 30) + 1
        };

        const yamaghantakaTime = (planets.Saturn.degree + 133.33) % 360;
        planets.Yamaghantaka = {
            name: "Yamaghantaka",
            degree: yamaghantakaTime,
            rasi: Math.floor(yamaghantakaTime / 30) + 1,
            house: Math.floor(yamaghantakaTime / 30) + 1
        };

        // Calculate divisional charts
        const divisionalCharts = {
            D1: { name: "Rasi (D1)", planets: {} },
            D2: { name: "Hora (D2)", planets: {} },
            D3: { name: "Drekkana (D3)", planets: {} },
            D6: { name: "Shashtamsa (D6)", planets: {} },
            D8: { name: "Ashtamsa (D8)", planets: {} },
            D9: { name: "Navamsa (D9)", planets: {} },
            D12: { name: "Dwadasamsa (D12)", planets: {} }
        };

        // Calculate divisional positions
        Object.keys(planets).forEach(planetName => {
            const planet = planets[planetName];

            // D1 (Rasi) - Original positions
            divisionalCharts.D1.planets[planetName] = {
                ...planet,
                divisional: {
                    degree: planet.degree,
                    rasi: planet.rasi
                }
            };

            // D2 (Hora) - Multiply by 2
            const horaDegree = (planet.degree * 2) % 360;
            divisionalCharts.D2.planets[planetName] = {
                ...planet,
                divisional: {
                    degree: horaDegree,
                    rasi: Math.floor(horaDegree / 30) + 1
                }
            };

            // D3 (Drekkana) - Multiply by 3
            const drekkanaDegree = (planet.degree * 3) % 360;
            divisionalCharts.D3.planets[planetName] = {
                ...planet,
                divisional: {
                    degree: drekkanaDegree,
                    rasi: Math.floor(drekkanaDegree / 30) + 1
                }
            };

            // D6 (Shashtamsa) - Multiply by 6
            const shashtamsaDegree = (planet.degree * 6) % 360;
            divisionalCharts.D6.planets[planetName] = {
                ...planet,
                divisional: {
                    degree: shashtamsaDegree,
                    rasi: Math.floor(shashtamsaDegree / 30) + 1
                }
            };

            // D8 (Ashtamsa) - Multiply by 8
            const ashtamsaDegree = (planet.degree * 8) % 360;
            divisionalCharts.D8.planets[planetName] = {
                ...planet,
                divisional: {
                    degree: ashtamsaDegree,
                    rasi: Math.floor(ashtamsaDegree / 30) + 1
                }
            };

            // D9 (Navamsa) - Multiply by 9
            const navamsaDegree = (planet.degree * 9) % 360;
            divisionalCharts.D9.planets[planetName] = {
                ...planet,
                divisional: {
                    degree: navamsaDegree,
                    rasi: Math.floor(navamsaDegree / 30) + 1
                }
            };

            // D12 (Dwadasamsa) - Multiply by 12
            const dwadasamsaDegree = (planet.degree * 12) % 360;
            divisionalCharts.D12.planets[planetName] = {
                ...planet,
                divisional: {
                    degree: dwadasamsaDegree,
                    rasi: Math.floor(dwadasamsaDegree / 30) + 1
                }
            };
        });

        // Calculate basic Panchanga data
        const panchanga = {
            tithi: "Calculated Tithi",
            nakshatra: "Calculated Nakshatra",
            yoga: "Calculated Yoga",
            karana: "Calculated Karana",
            weekday: datetime.weekdayLong,
            sunrise: "Calculated Sunrise",
            sunset: "Calculated Sunset"
        };

        return {
            birthDetails: birthData,
            planets: planets,
            divisionalCharts: divisionalCharts,
            panchanga: panchanga,
            datetime: datetime,
            ascendant: planets.Ascendant,
            houses: Array.from({ length: 12 }, (_, i) => ({
                number: i + 1,
                degree: (ascmc[0] + (i * 30)) % 360,
                sign: Math.floor(((ascmc[0] + (i * 30)) % 360) / 30) + 1
            }))
        };

    } catch (error) {
        console.error('❌ Error calculating VedicJyotish Kundli:', error);
        throw error;
    }
}

// Export the service
export default {
    initializeVedicJyotish,
    calculateVedicKundli
};
