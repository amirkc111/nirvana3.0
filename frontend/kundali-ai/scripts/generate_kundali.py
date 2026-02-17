# generate_kundali.py
# Requires: pyswisseph (swisseph) or swisseph Python bindings installed.
# This script produces a simple Kundali JSON using Swiss Ephemeris.
import swisseph as swe
import json
from datetime import datetime
import pytz

SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"]

def generate_kundali(yyyy, mm, dd, hh, mi, ss, tz_offset_hours, lat, lon, ayanamsa_deg=None):
    # tz_offset_hours: e.g., +5.5 => 5.5
    swe.set_ephe_path('.')
    # Convert to UT (rough conversion)
    local = datetime(yyyy, mm, dd, hh, mi, ss)
    # UTC hour approximation:
    ut_hour = hh - tz_offset_hours
    jd = swe.julday(yyyy, mm, dd, ut_hour + mi/60.0 + ss/3600.0)
    planets = {}
    planet_consts = [
        (swe.SUN, 'Sun'), (swe.MOON, 'Moon'), (swe.MARS, 'Mars'),
        (swe.MERCURY, 'Mercury'), (swe.JUPITER, 'Jupiter'),
        (swe.VENUS, 'Venus'), (swe.SATURN, 'Saturn'),
        (swe.TRUE_NODE, 'Rahu')
    ]
    for pc, name in planet_consts:
        lon, latp, dist = swe.calc_ut(jd, pc)[:3]
        sign_index = int((lon % 360) // 30)
        sign = SIGNS[sign_index]
        degree = (lon % 30)
        planets[name] = {"longitude": lon % 360, "sign": sign, "degree": round(degree, 4)}
    # Ascendant calculation
    asc = swe.houses(jd, lat, lon)[0][0]  # returns ascendant as degrees
    asc_sign = SIGNS[int((asc%360)//30)]
    kundali = {"datetime_utc_jd": jd, "ascendant": {"longitude": asc%360, "sign": asc_sign}, "planets": planets}
    return kundali

if __name__ == '__main__':
    # Example usage: uses approximate tz offset of +5.5
    k = generate_kundali(1997,11,2,12,7,0,5.5,27.7,86.0)
    with open('kundali.json','w') as f:
        json.dump(k, f, indent=2, ensure_ascii=False)
    print('kundali.json created')
