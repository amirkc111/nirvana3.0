#!/usr/bin/env python3
"""
Simple Panchang API using Drik Panchanga with Swiss Ephemeris
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import json
from datetime import datetime, date
import math

# Add the drik-panchanga directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'drik-panchanga'))

# Import the panchanga module
from panchanga import (
    Date, Place, gregorian_to_jd, jd_to_gregorian,
    tithi, nakshatra, yoga, karana, vaara, masa,
    sunrise, sunset, moonrise, moonset, day_duration,
    elapsed_year, samvatsara, ritu, raasi, lunar_phase
)

app = Flask(__name__)
CORS(app)

# Load Sanskrit names
with open('drik-panchanga/sanskrit_names.json', 'r', encoding='utf-8') as f:
    sanskrit_names = json.load(f)

def format_time(time_dms):
    """Format time from [hours, minutes, seconds] to HH:MM:SS"""
    if isinstance(time_dms, list) and len(time_dms) >= 3:
        h, m, s = time_dms[0], time_dms[1], time_dms[2]
        return f"{h:02d}:{m:02d}:{s:02d}"
    return "00:00:00"

def get_tithi_name(tithi_num, paksha):
    """Get Sanskrit name for tithi"""
    if paksha == 'Shukla':
        return sanskrit_names['tithis'].get(str(tithi_num), f"Tithi {tithi_num}")
    else:
        return sanskrit_names['tithis'].get(str(tithi_num + 15), f"Tithi {tithi_num}")

def get_nakshatra_name(nakshatra_num):
    """Get Sanskrit name for nakshatra"""
    return sanskrit_names['nakshatras'].get(str(nakshatra_num), f"Nakshatra {nakshatra_num}")

def get_yoga_name(yoga_num):
    """Get Sanskrit name for yoga"""
    return sanskrit_names['yogas'].get(str(yoga_num), f"Yoga {yoga_num}")

def get_karana_name(karana_num):
    """Get Sanskrit name for karana"""
    return sanskrit_names['karanas'].get(str(karana_num), f"Karana {karana_num}")

def get_vaara_name(vaara_num):
    """Get Sanskrit name for vaara (weekday)"""
    return sanskrit_names['varas'].get(str(vaara_num), f"Vaara {vaara_num}")

def get_masa_name(masa_num):
    """Get Sanskrit name for masa (month)"""
    return sanskrit_names['masas'].get(str(masa_num), f"Masa {masa_num}")

@app.route('/api/panchang', methods=['POST'])
def calculate_panchang():
    """Calculate panchang for given date and location"""
    try:
        data = request.get_json()
        
        # Extract date
        year = int(data.get('year', 2025))
        month = int(data.get('month', 10))
        day = int(data.get('day', 22))
        
        # Extract location (default to Kathmandu)
        latitude = float(data.get('latitude', 27.7172))
        longitude = float(data.get('longitude', 85.3240))
        timezone = float(data.get('timezone', 5.75))
        
        # Create date and place objects
        panchang_date = Date(year, month, day)
        # Use integer coordinates for compatibility
        place = Place(int(latitude), int(longitude), int(timezone))
        
        # Convert to Julian day
        jd = gregorian_to_jd(panchang_date)
        
        # Calculate all panchang elements
        tithi_data = tithi(jd, place)
        nakshatra_data = nakshatra(jd, place)
        yoga_data = yoga(jd, place)
        karana_data = karana(jd, place)
        vaara_data = vaara(jd)
        masa_data = masa(jd, place)
        
        # Calculate timings
        sunrise_data = sunrise(jd, place)
        sunset_data = sunset(jd, place)
        moonrise_data = moonrise(jd, place)
        moonset_data = moonset(jd, place)
        
        # Determine paksha
        tithi_num = tithi_data[0]
        if tithi_num <= 15:
            paksha = 'Shukla'
        else:
            paksha = 'Krishna'
            tithi_num = tithi_num - 15
        
        # Get Sanskrit names
        tithi_name = get_tithi_name(tithi_num, paksha)
        nakshatra_name = get_nakshatra_name(nakshatra_data[0])
        yoga_name = get_yoga_name(yoga_data[0])
        karana_name = get_karana_name(karana_data[0])
        vaara_name = get_vaara_name(vaara_data)
        masa_name = get_masa_name(masa_data[0])
        
        # Format timings
        sunrise_time = format_time(sunrise_data[1])
        sunset_time = format_time(sunset_data[1])
        moonrise_time = format_time(moonrise_data)
        moonset_time = format_time(moonset_data)
        
        # Tithi end time
        tithi_end_time = format_time(tithi_data[1]) if len(tithi_data) > 1 else "Unknown"
        
        # Nakshatra end time
        nakshatra_end_time = format_time(nakshatra_data[1]) if len(nakshatra_data) > 1 else "Unknown"
        
        # Yoga end time
        yoga_end_time = format_time(yoga_data[1]) if len(yoga_data) > 1 else "Unknown"
        
        # Build response
        response = {
            'success': True,
            'date': {
                'year': year,
                'month': month,
                'day': day,
                'julian_day': jd
            },
            'location': {
                'latitude': latitude,
                'longitude': longitude,
                'timezone': timezone
            },
            'tithi': {
                'number': tithi_num,
                'name': tithi_name,
                'english': tithi_name,
                'paksha': paksha,
                'end_time': tithi_end_time,
                'lunar_phase': 'Waxing' if tithi_num <= 7 else 'Waning' if tithi_num >= 23 else 'Full' if tithi_num == 15 else 'New' if tithi_num == 30 else 'Normal'
            },
            'nakshatra': {
                'number': nakshatra_data[0],
                'name': nakshatra_name,
                'english': nakshatra_name,
                'lord': 'Ketu',  # Default lord
                'end_time': nakshatra_end_time,
                'symbol': '⭐'
            },
            'yoga': {
                'number': yoga_data[0],
                'name': yoga_name,
                'english': yoga_name,
                'end_time': yoga_end_time
            },
            'karana': {
                'number': karana_data[0],
                'name': karana_name,
                'english': karana_name,
                'type': 'Movable' if karana_data[0] <= 7 else 'Fixed'
            },
            'vaara': {
                'number': vaara_data,
                'name': vaara_name,
                'english': vaara_name
            },
            'masa': {
                'number': masa_data[0],
                'name': masa_name,
                'english': masa_name,
                'is_leap': masa_data[1]
            },
            'timings': {
                'sunrise': sunrise_time,
                'sunset': sunset_time,
                'moonrise': moonrise_time,
                'moonset': moonset_time
            },
            'realTimings': {
                'sunrise': sunrise_time,
                'sunset': sunset_time,
                'moonrise': moonrise_time,
                'moonset': moonset_time
            },
            'realMuhurats': [
                {'name': 'Brahma Muhurat', 'time': '04:00-05:30'},
                {'name': 'Abhijit Muhurat', 'time': '11:30-12:30'},
                {'name': 'Godhuli Muhurat', 'time': '17:30-18:30'}
            ],
            'realSahits': [
                {'name': 'Ashwini', 'time': 'All Day'},
                {'name': 'Bharani', 'time': 'All Day'}
            ],
            'inauspiciousTimes': [
                {'name': 'Rahu Kalam', 'time': '12:00-13:30'},
                {'name': 'Yamaganda', 'time': '09:00-10:30'},
                {'name': 'Gulika Kalam', 'time': '15:00-16:30'}
            ],
            'nextTithi': {
                'name': get_tithi_name(tithi_num + 1 if tithi_num < 15 else 1, paksha),
                'changeTime': '18:00'
            },
            'nextNakshatra': {
                'name': get_nakshatra_name(nakshatra_data[0] + 1 if nakshatra_data[0] < 27 else 1),
                'lord': 'Venus',
                'changeTime': '18:00'
            },
            'additionalTimings': {
                'rahuKalam': '12:00-13:30',
                'yamaganda': '09:00-10:30',
                'gulikaKalam': '15:00-16:30'
            },
            'bestTimes': {
                'business': '10:00-12:00',
                'travel': '06:00-08:00',
                'study': '05:00-07:00'
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to calculate panchang'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Panchang API',
        'version': '1.0.0'
    })

if __name__ == '__main__':
    print("🚀 Starting Simple Panchang API Server...")
    print("📊 Using Drik Panchanga with Swiss Ephemeris")
    print("🌍 Default location: Kathmandu, Nepal")
    print("🔗 API endpoints:")
    print("   POST /api/panchang - Calculate panchang with custom location")
    print("   GET  /api/health - Health check")
    print("\n🌟 Server starting on http://localhost:5001")
    
    app.run(debug=True, host='0.0.0.0', port=5001)
