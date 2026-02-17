// Real VedicJyotish Integration Service
// This service integrates with the actual VedicJyotish calculations

import { DateTime } from 'luxon';

// Import the actual VedicJyotish services
// Note: We'll need to adapt these for our Next.js environment

class RealKundliService {
    constructor() {
        this.initialized = false;
        this.sweph = null;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            // Import sweph-wasm for Swiss Ephemeris calculations
            const { default: sweph } = await import('sweph-wasm');
            this.sweph = sweph;
            
            // Initialize Swiss Ephemeris
            await this.sweph.init();
            this.initialized = true;
            
            console.log('✅ VedicJyotish service initialized');
        } catch (error) {
            console.error('❌ Failed to initialize VedicJyotish service:', error);
            throw error;
        }
    }

    async calculateKundli(birthData) {
        await this.initialize();

        try {
            const {
                name,
                birthYear,
                birthMonth,
                birthDay,
                birthHour,
                birthMinute,
                latitude,
                longitude,
                timezone
            } = birthData;

            // Create DateTime object
            const birthDateTime = DateTime.fromObject({
                year: birthYear,
                month: birthMonth,
                day: birthDay,
                hour: birthHour,
                minute: birthMinute,
                zone: `UTC${timezone >= 0 ? '+' : ''}${timezone}`
            });

            console.log('🕐 Birth DateTime:', birthDateTime.toISO());

            // Set sidereal mode (Lahiri Ayanamsa)
            this.sweph.swe_set_sid_mode(this.sweph.SE_SIDM_LAHIRI, 0, 0);

            // Set location
            this.sweph.swe_set_topo(longitude, latitude, 0);

            // Convert to Julian Day
            const utc_dt = birthDateTime.toUTC();
            const tjd_ut = this.sweph.swe_utc_to_jd(
                utc_dt.year,
                utc_dt.month,
                utc_dt.day,
                utc_dt.hour,
                utc_dt.minute,
                utc_dt.second,
                this.sweph.SE_GREG_CAL
            )[1];

            console.log('📅 Julian Day:', tjd_ut);

            // Calculate houses
            const { ascmc } = this.sweph.swe_houses(
                tjd_ut,
                latitude,
                longitude,
                "P" // Placidus house system
            );

            // Calculate planetary positions
            const planets = {};
            const planetIds = {
                'Sun': this.sweph.SE_SUN,
                'Moon': this.sweph.SE_MOON,
                'Mars': this.sweph.SE_MARS,
                'Mercury': this.sweph.SE_MERCURY,
                'Jupiter': this.sweph.SE_JUPITER,
                'Venus': this.sweph.SE_VENUS,
                'Saturn': this.sweph.SE_SATURN,
                'Rahu': this.sweph.SE_TRUE_NODE,
                'Ketu': this.sweph.SE_TRUE_NODE // Ketu is opposite to Rahu
            };

            // Add Ascendant
            planets.Ascendant = {
                name: { english: 'Ascendant', hindi: 'लग्न' },
                degree: ascmc[0],
                rasi: Math.floor(ascmc[0] / 30) + 1,
                house: 1,
                color: '#1e90ff'
            };

            // Calculate planets
            for (const [planetName, planetId] of Object.entries(planetIds)) {
                const result = this.sweph.swe_calc_ut(tjd_ut, planetId, this.sweph.SEFLG_SWIEPH | this.sweph.SEFLG_SPEED | this.sweph.SEFLG_SIDEREAL);
                
                if (result && result.length > 0) {
                    let degree = result[0];
                    
                    // For Ketu, add 180 degrees (opposite of Rahu)
                    if (planetName === 'Ketu') {
                        degree = (degree + 180) % 360;
                    }

                    const rasi = Math.floor(degree / 30) + 1;
                    const house = this.calculateHouse(degree, ascmc);

                    planets[planetName] = {
                        name: { 
                            english: planetName, 
                            hindi: this.getHindiName(planetName) 
                        },
                        degree: degree,
                        rasi: rasi,
                        house: house,
                        color: this.getPlanetColor(planetName)
                    };
                }
            }

            // Calculate divisional charts
            const divisionalCharts = this.calculateDivisionalCharts(planets);

            // Calculate Panchanga
            const panchanga = await this.calculatePanchanga(birthDateTime, latitude, longitude);

            return {
                name,
                birthData,
                planets,
                divisionalCharts,
                panchanga,
                houses: this.calculateHouses(ascmc),
                ascendant: planets.Ascendant.rasi
            };

        } catch (error) {
            console.error('❌ Error calculating Kundli:', error);
            throw error;
        }
    }

    calculateHouse(degree, ascmc) {
        // Calculate which house a planet is in based on its degree
        const houses = ascmc.slice(0, 12);
        for (let i = 0; i < 12; i++) {
            const nextHouse = houses[(i + 1) % 12];
            const currentHouse = houses[i];
            
            // Handle the 12th house to 1st house transition
            if (i === 11) {
                if (degree >= currentHouse || degree < nextHouse) {
                    return i + 1;
                }
            } else {
                if (degree >= currentHouse && degree < nextHouse) {
                    return i + 1;
                }
            }
        }
        return 1; // Default to 1st house
    }

    calculateHouses(ascmc) {
        const houses = [];
        for (let i = 0; i < 12; i++) {
            houses.push({
                number: i + 1,
                degree: ascmc[i],
                rasi: Math.floor(ascmc[i] / 30) + 1
            });
        }
        return houses;
    }

    calculateDivisionalCharts(planets) {
        const divisionalCharts = {};
        
        // D2 (Hora) - 2nd divisional chart
        divisionalCharts.D2 = this.calculateDivisionalChart(planets, 2);
        
        // D6 (Shashtamsa) - 6th divisional chart  
        divisionalCharts.D6 = this.calculateDivisionalChart(planets, 6);
        
        // D8 (Ashtamsa) - 8th divisional chart
        divisionalCharts.D8 = this.calculateDivisionalChart(planets, 8);
        
        // D9 (Navamsa) - 9th divisional chart
        divisionalCharts.D9 = this.calculateDivisionalChart(planets, 9);

        return divisionalCharts;
    }

    calculateDivisionalChart(planets, divisor) {
        const chartPlanets = {};
        
        for (const [planetName, planetData] of Object.entries(planets)) {
            if (planetData.degree !== undefined) {
                const divisionalDegree = (planetData.degree * divisor) % 360;
                const divisionalRasi = Math.floor(divisionalDegree / 30) + 1;
                const divisionalHouse = Math.floor(divisionalDegree / 30) + 1;
                
                chartPlanets[planetName] = {
                    name: planetData.name,
                    degree: divisionalDegree,
                    rasi: divisionalRasi,
                    house: divisionalHouse,
                    color: planetData.color
                };
            }
        }
        
        return chartPlanets;
    }

    async calculatePanchanga(datetime, latitude, longitude) {
        // Simplified Panchanga calculation
        // In a real implementation, this would use the full VedicJyotish Panchanga service
        
        return {
            tithi: {
                name: { hindi: 'पूर्णिमा', english: 'Purnima' },
                number: 15
            },
            nakshatra: {
                name: { hindi: 'रोहिणी', english: 'Rohini' },
                number: 4
            },
            yoga: {
                name: { hindi: 'सिद्धि', english: 'Siddhi' },
                number: 11
            },
            karana: {
                name: { hindi: 'विष्टि', english: 'Vishti' },
                number: 4
            },
            vara: {
                name: { hindi: 'सोमवार', english: 'Monday' },
                number: 2
            },
            sunrise: {
                dt: datetime.startOf('day').plus({ hours: 6 })
            },
            sunset: {
                dt: datetime.startOf('day').plus({ hours: 18 })
            }
        };
    }

    getHindiName(planetName) {
        const hindiNames = {
            'Sun': 'सूर्य',
            'Moon': 'चंद्र',
            'Mars': 'मंगल',
            'Mercury': 'बुध',
            'Jupiter': 'गुरु',
            'Venus': 'शुक्र',
            'Saturn': 'शनि',
            'Rahu': 'राहु',
            'Ketu': 'केतु',
            'Ascendant': 'लग्न'
        };
        return hindiNames[planetName] || planetName;
    }

    getPlanetColor(planetName) {
        const colors = {
            'Sun': '#f39c12',
            'Moon': '#5dade2',
            'Mars': '#e74c3c',
            'Mercury': '#27ae60',
            'Jupiter': '#b7950b',
            'Venus': '#ff69b4',
            'Saturn': '#5d6d7e',
            'Rahu': '#7f8c8d',
            'Ketu': '#d35400',
            'Ascendant': '#1e90ff'
        };
        return colors[planetName] || '#000000';
    }
}

// Export singleton instance
export const realKundliService = new RealKundliService();
export default realKundliService;
