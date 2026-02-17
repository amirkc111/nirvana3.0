// VedicJyotish Redirect Service
// This service handles redirecting to the VedicJyotish system with birth data

export function redirectToVedicJyotish(birthData) {
    try {
        // Convert birth data to the format expected by VedicJyotish
        const vedicJyotishData = {
            name: birthData.name,
            date: formatDateForVedicJyotish(birthData),
            time: formatTimeForVedicJyotish(birthData),
            lat: birthData.birth_latitude || birthData.lat,
            lon: birthData.birth_longitude || birthData.lon,
            tznm: getTimezoneForVedicJyotish(birthData),
            city: birthData.birth_place || birthData.city
        };

        // Create URL parameters
        const params = new URLSearchParams({
            name: vedicJyotishData.name,
            date: vedicJyotishData.date,
            time: vedicJyotishData.time,
            lat: vedicJyotishData.lat,
            lon: vedicJyotishData.lon,
            tznm: vedicJyotishData.tznm,
            city: vedicJyotishData.city
        });

        // Redirect to VedicJyotish system (Next.js route with save button) with cache busting
        const timestamp = Date.now();
        const vedicJyotishUrl = `/vedicjyotish?${params.toString()}&t=${timestamp}`;
        
        console.log('🔮 Redirecting to VedicJyotish with data:', vedicJyotishData);
        console.log('🌐 VedicJyotish URL:', vedicJyotishUrl);
        
        // Open in new tab
        window.open(vedicJyotishUrl, '_blank');
        
        return true;
    } catch (error) {
        console.error('❌ Error redirecting to VedicJyotish:', error);
        return false;
    }
}

function formatDateForVedicJyotish(birthData) {
    // Convert to AD format if it's BS
    let year = birthData.birth_year;
    let month = birthData.birth_month;
    let day = birthData.birth_day;

    if (birthData.date_system === 'BS') {
        // Convert BS to AD (approximate conversion: BS - 57 = AD)
        year = year - 57;
    }

    // Format as YYYY-MM-DD
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

function formatTimeForVedicJyotish(birthData) {
    let hour = birthData.birth_hour;
    let minute = birthData.birth_minute;
    let second = birthData.birth_second || 0;

    // Convert to 24-hour format if it's PM
    if (birthData.time_system === 'PM' && hour !== 12) {
        hour = hour + 12;
    } else if (birthData.time_system === 'AM' && hour === 12) {
        hour = 0;
    }

    // Format as HH:MM:SS
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
}

function getTimezoneForVedicJyotish(birthData) {
    // Default timezone based on coordinates or use provided timezone
    if (birthData.timezone) {
        return birthData.timezone;
    }

    // Determine timezone based on coordinates (Nepal/India region)
    const lat = birthData.birth_latitude || birthData.lat;
    const lon = birthData.birth_longitude || birthData.lon;

    if (lat >= 26 && lat <= 30 && lon >= 80 && lon <= 88) {
        return 'Asia/Kathmandu'; // Nepal
    } else if (lat >= 6 && lat <= 37 && lon >= 68 && lon <= 97) {
        return 'Asia/Kolkata'; // India
    } else {
        return 'Asia/Kathmandu'; // Default to Nepal timezone
    }
}

// Alternative method: Create a local VedicJyotish instance
export function createLocalVedicJyotishInstance(birthData) {
    try {
        // This would create a local instance of VedicJyotish
        // For now, we'll redirect to the external system
        return redirectToVedicJyotish(birthData);
    } catch (error) {
        console.error('❌ Error creating local VedicJyotish instance:', error);
        return false;
    }
}

export default {
    redirectToVedicJyotish,
    createLocalVedicJyotishInstance
};
