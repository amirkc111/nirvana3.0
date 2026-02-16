'use client';

import DynamicKundliChart from './DynamicKundliChart';

export default function HouseTest() {
  const testData = {
    type: "D1",
    ascendant: 1,
    houses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    planets: [
      { name: 'लग्न', house: 1, color: '#1e90ff' },
      { name: 'चंद्र', house: 1, color: '#5dade2' },
      { name: 'केतु', house: 11, color: '#d35400' },
      { name: 'गुरु', house: 11, color: '#b7950b' },
      { name: 'बुध', house: 9, color: '#27ae60' },
      { name: 'सूर्य', house: 9, color: '#f39c12' },
      { name: 'मंगल', house: 9, color: '#e74c3c' },
      { name: 'शुक्र', house: 9, color: '#ff69b4' },
      { name: 'शनि', house: 2, color: '#5d6d7e' },
      { name: 'राहु', house: 6, color: '#7f8c8d' }
    ]
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">House Position Test</h2>
      <p className="mb-4">Each house should have a unique Nepali number and planets should be positioned correctly.</p>
      <DynamicKundliChart chartData={testData} />
    </div>
  );
}
