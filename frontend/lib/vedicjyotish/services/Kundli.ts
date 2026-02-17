// Import utility functions
import type { DateTime } from "luxon";
import { getPanchanga } from "./calcPanchanga/index";
import { Planet, type PlanetEn } from "./constants/Planet";
import { MOD360 } from "./utils";

// getPlanetaryPosition
export function Kundli(
    datetime: DateTime<true>,
    longitude: number, // north positive
    latitude: number, // east positive
    altitude: number = 0 // height above sea level in meters
) {
    // Resolve 'swe' from global/window
    // @ts-ignore
    const swe = typeof window !== 'undefined' ? window.swe : global.swe;
    if (!swe) {
        throw new Error("Swiss Ephemeris (swe) not initialized. Call initializeVedicJyotish() first.");
    }

    // todo : we neet to use tjd_et (Julian Day in Ephemeris Time or Terrestrial Time):

    // swe.SEFLG_EQUATORIAL; this for chalit
    const IFLAGS = swe.SEFLG_SWIEPH | swe.SEFLG_SPEED | swe.SEFLG_SIDEREAL;

    swe.swe_set_sid_mode(swe.SE_SIDM_LAHIRI, 0, 0);

    // Setup location detail
    swe.swe_set_topo(longitude, latitude, altitude);

    // Convert current system time to Julian Day UT
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

    // Calculate Ayanamsa (Lahiri/Sidereal offset)
    const ayanamsa = swe.swe_get_ayanamsa_ut(tjd_ut);

    // Ascendant etc. (Tropical)
    const { ascmc } = swe.swe_houses(
        tjd_ut,
        latitude,
        longitude,
        "P" // W = equal whole sign
    );

    // Convert Tropical Ascendant to Sidereal (Nirayana) by subtracting Ayanamsa
    let siderealAscendant = ascmc[0] - ayanamsa;
    if (siderealAscendant < 0) siderealAscendant += 360;

    // Add Ascendant
    const planets = {} as Record<PlanetEn, Planet>;
    planets.Ascendant = new Planet("Ascendant", [siderealAscendant]);

    // Planets
    const PLANET_IDS: Record<string, number> = {
        "Sun": swe.SE_SUN,
        "Moon": swe.SE_MOON,
        "Mercury": swe.SE_MERCURY,
        "Venus": swe.SE_VENUS,
        "Mars": swe.SE_MARS,
        "Jupiter": swe.SE_JUPITER,
        "Saturn": swe.SE_SATURN,
        "Uranus": swe.SE_URANUS,
        "Neptune": swe.SE_NEPTUNE,
        "Pluto": swe.SE_PLUTO,
        "Rahu": swe.SE_TRUE_NODE,
    };

    Object.entries(PLANET_IDS).forEach((entry) => {
        const planetName = entry[0];
        const planetId = entry[1];
        const vCoords = swe.swe_calc_ut(tjd_ut, planetId, IFLAGS);
        const hCoords = swe.swe_azalt(
            tjd_ut,
            swe.SE_EQU2HOR,
            [longitude, latitude, altitude],
            0,
            0,
            [vCoords[0], vCoords[1], vCoords[2]]
        );

        // Map planets using ephe_data
        planets[planetName as PlanetEn] = new Planet(
            planetName as PlanetEn,
            vCoords,
            hCoords,
            planets.Ascendant.rasi.rasi_num
        );

        if (planetName === "Rahu") {
            // Ketu is always 180° opposite to Rahu (i.e., Ketu = Rahu + 180°)
            vCoords[0] += 180;
            planets.Ketu = new Planet(
                "Ketu",
                vCoords,
                hCoords,
                planets.Ascendant.rasi.rasi_num
            );
        }
    });

    // धूम (Dhuma) is calculated by adding 133°20′ to the Sun's position
    planets.Dhuma = new Planet(
        "Dhuma",
        [planets.Sun.degree + 133 + 20 / 60],
        [],
        planets.Ascendant.rasi.rasi_num
    );

    // व्यतीपात (Vyatipata) is 360° minus Dhuma's position (its opposite point)
    planets.Vyatipata = new Planet(
        "Vyatipata",
        [360 - planets.Dhuma.degree],
        [],
        planets.Ascendant.rasi.rasi_num
    );

    // परिवेष (Parivesha) is 180° added to Vyatipata (opposite of Vyatipata)
    planets.Parivesha = new Planet(
        "Parivesha",
        [planets.Vyatipata.degree + 180],
        [],
        planets.Ascendant.rasi.rasi_num
    );

    // इन्द्रचाप (Chapa / Indrachapa) is 360° minus Parivesha
    planets.Chapa = new Planet(
        "Chapa",
        [360 - planets.Parivesha.degree],
        [],
        planets.Ascendant.rasi.rasi_num
    );

    // उपकेतु (Upaketu / Sikhii) is Chapa + 16°40′
    planets.Upaketu = new Planet(
        "Upaketu",
        [planets.Chapa.degree + 16 + 40 / 60],
        [],
        planets.Ascendant.rasi.rasi_num
    );

    const panchanga = getPanchanga(
        datetime.minus({
            days: planets.Ascendant.degree - planets.Sun.degree < 0 ? 1 : 0,
        }) as DateTime<true>,
        longitude,
        latitude
    );

    Object.entries(panchanga.kalavelas.day_kalavelas).forEach(
        (entry) => {
            const name = entry[0];
            const timespan = entry[1];
            planets[name as PlanetEn] = new Planet(
                name as PlanetEn,
                [
                    swe.swe_houses(timespan.start, latitude, longitude, "P")
                        .ascmc[0],
                ],
                [],
                planets.Ascendant.rasi.rasi_num
            );
        }
    );

    return {
        panchanga,
        datetime,
        planets,
        daybirth: MOD360(planets.Ascendant.degree - planets.Sun.degree) < 180,
    };
}

export type KundliData = Awaited<ReturnType<typeof Kundli>>;
