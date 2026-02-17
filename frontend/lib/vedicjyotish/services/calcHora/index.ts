import { decimalToHMS } from "../utils";

/**
 * Calculates the current Hora (Planetary Hour) based on birth time.
 * @param {number} sunriseJd - Sunrise Julian Day
 * @param {number} sunsetJd - Sunset Julian Day
 * @param {number} nextSunriseJd - Next Day Sunrise Julian Day
 * @param {number} birthJd - Birth Time Julian Day
 * @param {number} dayOfWeek - Day of week (0=Sunday, 6=Saturday)
 */
export function calcHora(sunriseJd, sunsetJd, nextSunriseJd, birthJd, dayOfWeek) {
    const isDay = birthJd >= sunriseJd && birthJd < sunsetJd;
    const isNight = !isDay;

    let duration = 0;
    let startTime = 0;
    let horaIndex = 0;

    if (isDay) {
        duration = (sunsetJd - sunriseJd) / 12;
        startTime = sunriseJd;
        horaIndex = Math.floor((birthJd - sunriseJd) / duration);
    } else {
        // Handle night time logic carefully
        // If birth is before midnight but after sunset
        // If birth is after midnight but before sunrise
        let effectiveSunset = sunsetJd;
        let effectiveNextSunrise = nextSunriseJd;

        // If birth is before sunrise (e.g. 2 AM), it belongs to previous day's night period conceptually for Hora
        // But the input sunriseJd/sunsetJd are usually for the calendar day of birth.
        // Assuming standard inputs where sunriseJd <= birthJd check handled by caller or pre-calc.

        // Simplified: The caller passes the sunrise/sunset governing the "Vedic Day".
        // If birthJd < sunriseJd, it's technically previous Vedic day, but let's assume inputs are correct for the birth moment.

        if (birthJd < sunriseJd) {
            // This case suggests inputs might be off or birth is early morning
            // For safety, let's treat it relative to the provided sunset/nextSunrise if it falls in that range
            // actually standard login: Day starts at Sunrise.
        }

        duration = (nextSunriseJd - sunsetJd) / 12;
        startTime = sunsetJd;
        horaIndex = Math.floor((birthJd - sunsetJd) / duration);
    }

    // Hora Lords Sequence (Day)
    // Sunday: Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars...
    // Sequence is: Current Day Lord -> 6th from it -> 6th from it...
    // Order of Planets (velocity): Sat, Jup, Mar, Sun, Ven, Mer, Moon (Slowest to Fastest)
    // Hours are ruled by:
    // 1st hour: Day Lord
    // 2nd hour: 6th day lord from current... 
    // Easier pattern: Cyclic order in reverse speed: Sun(1) -> Ven(6) -> Mer(4) -> Moon(2) -> Sat(7) -> Jup(5) -> Mars(3)
    // Let's use standard mapping array: Sun=0, Moon=1, Mars=2, Mer=3, Jup=4, Ven=5, Sat=6

    // The standard cycle of Horas starting from Day Lord:
    // [DayLord, +5, +5, +5...] mod 7? No.
    // Sunday (0): Sun(0), Ven(5), Mer(3), Moon(1), Sat(6), Jup(4), Mar(2)
    // 0 -> 5 (+5)
    // 5 -> 3 (+5 => 10%7=3)
    // 3 -> 1 (+5 => 8%7=1) ... Yes, it is +5 (or -2) modulo 7 logic.

    // Day of Week: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    // If it is Sunday (0), 1st Hora is Sun (0). 2nd is 0+5=5(Ven).
    // Night logic:
    // The 1st Hora of night is the 13th Hora of the day sequence.
    // 1st Day Hora: DayLord
    // 12th Day Hora: DayLord + 11*5
    // 1st Night Hora (13th): DayLord + 12*5 = DayLord + 60 = DayLord + 4 (mod 7).
    // Which represents the 5th planet from DayLord.
    // Actually, simpler logic: The sequence is continuous.

    // Total Index from Sunrise = (isDay ? 0 : 12) + horaIndex;
    const totalIndex = (isDay ? 0 : 12) + horaIndex;

    // Calculate Lord
    // Lord index = (DayOfWeek + totalIndex * 5) % 7
    // Mapping: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    const lordNum = (dayOfWeek + totalIndex * 5) % 7;

    const planetNames = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
    const lordName = planetNames[lordNum];

    // Calculate Time Range
    const startJd = startTime + (horaIndex * duration);
    const endJd = startJd + duration;

    // Remaining time in current Hora
    const remainingJd = endJd - birthJd;
    // Convert duration to minutes
    const remainingMins = Math.round(remainingJd * 24 * 60);

    return {
        lord: lordName,
        index: totalIndex + 1, // 1-24
        type: isDay ? "Day Hora" : "Night Hora",
        startTime: decimalToHMS(startJd),
        endTime: decimalToHMS(endJd),
        remainingMinutes: remainingMins,
        durationMins: Math.round(duration * 24 * 60)
    };
}
