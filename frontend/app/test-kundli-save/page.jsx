"use client";
import { useState } from 'react';

export default function TestKundliSavePage() {
  const [saveStatus, setSaveStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const testSaveKundli = async () => {
    setIsLoading(true);
    setSaveStatus(null);

    try {
      console.log('🧪 Testing Kundli data save...');
      
      // Test data for aayan
      const testData = {
        name: "aayan",
        date: "2017-11-17",
        time: "11:15:00",
        lat: "27.7172",
        lon: "85.324",
        tznm: "5.75",
        city: "Kathmandu, Bagmati Province, Nepal",
        kundliData: {
          basicDetails: {
            name: "aayan",
            date: "2017-11-17",
            time: "11:15:00",
            location: "Kathmandu, Bagmati Province, Nepal"
          },
          planetaryPositions: {
            sun: { position: "10° Scorpio", sign: "Scorpio", degree: "10°" },
            moon: { position: "15° Libra", sign: "Libra", degree: "15°" },
            mars: { position: "8° Leo", sign: "Leo", degree: "8°" }
          },
          yogaPhala: [
            { name: "Gaja Kesari Yoga", description: "Jupiter in Kendra from Moon", effect: "Wealth and prosperity" }
          ],
          vimsottariDasha: [
            { planet: "Jupiter", period: "16 years", startDate: "2017-11-17", endDate: "2033-11-17" }
          ],
          divisionalCharts: {
            rashi: { house_1: { sign: "Scorpio", planets: [{ name: "Sun", degree: "10°", sign: "Scorpio" }] } },
            navamsa: { house_1: { sign: "Leo", planets: [{ name: "Sun", degree: "5°", sign: "Leo" }] } },
            dasamsa: { house_1: { sign: "Capricorn", planets: [{ name: "Saturn", degree: "12°", sign: "Capricorn" }] } }
          },
          chartCalculations: {
            ayanamsa: "23°45'30\"",
            siderealTime: "14:30:25",
            localTime: "11:15:00",
            timezone: "5.75"
          },
          chartImages: {
            rashiImage: "/images/rashi_chart.png",
            navamsaImage: "/images/navamsa_chart.png"
          }
        }
      };

      const response = await fetch('/api/save-kundli', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      const result = await response.json();
      
      if (response.ok) {
        setSaveStatus({ success: true, message: 'Kundli data saved successfully!', data: result });
        console.log('✅ Kundli data saved successfully:', result);
      } else {
        setSaveStatus({ success: false, message: result.error || 'Failed to save Kundli data' });
        console.error('❌ Failed to save Kundli data:', result);
      }
    } catch (error) {
      setSaveStatus({ success: false, message: error.message });
      console.error('❌ Error saving Kundli data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Test Kundli Data Save</h1>
      <p>This page tests saving Kundli analysis data to the database.</p>
      
      <button 
        onClick={testSaveKundli}
        disabled={isLoading}
        style={{
          padding: '10px 20px',
          backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: '500'
        }}
      >
        {isLoading ? 'Saving...' : 'Test Save Kundli Data'}
      </button>

      {saveStatus && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          borderRadius: '5px',
          backgroundColor: saveStatus.success ? '#d1fae5' : '#fee2e2',
          color: saveStatus.success ? '#065f46' : '#991b1b',
          border: `1px solid ${saveStatus.success ? '#a7f3d0' : '#fecaca'}`
        }}>
          <h3>{saveStatus.success ? '✅ Success!' : '❌ Error'}</h3>
          <p>{saveStatus.message}</p>
          {saveStatus.data && (
            <details style={{ marginTop: '10px' }}>
              <summary>View Response Data</summary>
              <pre style={{ 
                background: '#f3f4f6', 
                padding: '10px', 
                borderRadius: '3px', 
                marginTop: '10px',
                fontSize: '12px',
                overflow: 'auto'
              }}>
                {JSON.stringify(saveStatus.data, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}

      <div style={{ marginTop: '30px', fontSize: '14px', color: '#6b7280' }}>
        <h3>What this test does:</h3>
        <ul style={{ marginLeft: '20px' }}>
          <li>Creates test Kundli data for "aayan"</li>
          <li>Includes planetary positions, yoga phala, dasha periods</li>
          <li>Includes divisional charts (Rashi, Navamsa, Dasamsa)</li>
          <li>Includes chart calculations and metadata</li>
          <li>Saves all data to the database via API</li>
        </ul>
      </div>
    </div>
  );
}
