import React from "react";

const DynamicKundliChart = ({ chartData, variant = 'D1', onHouseSelect, activeHouse }) => {
  // Safe access to nested data (API structure: { planets: {...}, analysis: ... })
  const data = chartData?.planets || chartData?.kundaliData || chartData;

  // DETERMINE DATA SOURCE BASED ON VARIANT
  // D1 (Lagna): use .rasi
  // D9 (Navamsa): use .divisional.navamsa.rasi

  let getSign = (planetData) => planetData?.rasi?.rasi_num;

  if (variant === 'D9') {
    getSign = (planetData) => planetData?.divisional?.navamsa?.rasi_num;
  }

  // Get Ascendant Sign
  const ascendantSign = data?.Ascendant ? getSign(data.Ascendant) || 1 : 1;

  // New Coordinate System (from User SVG)
  const width = 400;
  const height = 267; // approx for 3:2 ratio

  // Theme: Exact match from User SVG
  const theme = {
    bg: "#EFB861",       // Golden/Mustard
    border: "#B80000",   // Deep Red
    textMain: "#540000", // Dark Red text
    textDim: "#757370",  // Dimmed text
  };

  /**
   * Helper: Calculate Rasi number for a given House (1-12)
   */
  const getSignForHouse = (houseNum) => {
    let sign = (ascendantSign + houseNum - 1) % 12;
    if (sign === 0) sign = 12;
    return sign;
  };

  /**
   * HOUSE CENTERS & SIGN POSITIONS
   * Remapped for 400x267 coordinate system
   */
  const houses = {
    1: { center: { x: 200, y: 88 }, sign: { x: 200, y: 120 } },       // Top Diamond (Lagna)
    2: { center: { x: 97, y: 42 }, sign: { x: 130, y: 25 } },         // Top Left
    3: { center: { x: 58, y: 76 }, sign: { x: 40, y: 40 } },          // Left Upper
    4: { center: { x: 100, y: 133 }, sign: { x: 160, y: 133 } },      // Left Diamond
    5: { center: { x: 58, y: 190 }, sign: { x: 40, y: 226 } },        // Left Lower
    6: { center: { x: 97, y: 228 }, sign: { x: 130, y: 245 } },       // Bottom Left
    7: { center: { x: 200, y: 178 }, sign: { x: 200, y: 146 } },      // Bottom Diamond
    8: { center: { x: 304, y: 228 }, sign: { x: 270, y: 245 } },      // Bottom Right
    9: { center: { x: 341, y: 190 }, sign: { x: 360, y: 226 } },      // Right Lower
    10: { center: { x: 300, y: 133 }, sign: { x: 240, y: 133 } },     // Right Diamond
    11: { center: { x: 341, y: 76 }, sign: { x: 360, y: 40 } },       // Right Upper
    12: { center: { x: 304, y: 42 }, sign: { x: 270, y: 25 } },       // Top Right
  };

  /**
   * PREPARE PLANETS
   */
  const planets = [];
  // Vedic Planets only
  const vedicPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

  if (data) {
    Object.entries(data).forEach(([key, val]) => {
      // Filter: Skip Ascendant (handled separately) AND non-Vedic bodies
      if (key !== 'Ascendant' && val && vedicPlanets.includes(key)) {

        let planetSign = getSign(val);
        if (planetSign) {
          // Calculate House: Planet Sign - Ascendant Sign + 1
          let house = (planetSign - ascendantSign + 1);
          if (house <= 0) house += 12;

          // Custom short names for Traditional Look (Nepali/Devanagari)
          const shortNames = {
            'Sun': 'सू', 'Moon': 'चं', 'Mars': 'मं', 'Mercury': 'बु',
            'Jupiter': 'गु', 'Venus': 'शु', 'Saturn': 'श', 'Rahu': 'रा', 'Ketu': 'के'
          };

          planets.push({
            name: shortNames[key] || key.substring(0, 2),
            house: house,
            isRetro: val.isRetro || false,
            degree: val.degree || val.normDegree || 0
          });
        }
      }
    });

    // Add Lagna (Ascendant) explicitly as 'ल' (Lagna) in House 1
    planets.push({ name: 'ल', house: 1, isRetro: false, degree: 0 });
  }

  // GROUP PLANETS to avoid collision
  const groupedPlanets = planets.reduce((acc, p) => {
    acc[p.house] = acc[p.house] || [];
    acc[p.house].push(p);
    return acc;
  }, {});

  return (
    <div className="relative inline-block drop-shadow-lg rounded-sm overflow-hidden bg-[#EFB861] w-full">
      {/* SVG CONTAINER - Using exact viewBox from reference */}
      <svg viewBox="0 0 400 266.6667" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        {/* STATIC BACKGROUND PATHS (From User) */}
        <rect x="0" y="0" width="400" height="266.6667" fill={theme.bg} stroke={theme.border} strokeWidth="2"></rect>

        {/* HOUSE GEOMETRY (Interactive) */}
        {[
          { id: 1, d: "M 200,0 Q 200,36.3636 241.665,38.095 Q 283.33,39.8264 283.33,76.19 L 210 123.33 L 200 123.33 L 200 133.33 L 190 133.33 L 190 123.33 L 116.67 76.19 Q 116.67,39.8264 158.335,38.095 Q 200,36.3636 200,0 z" },
          { id: 10, d: "M 283.33 76.19 Q 319.6936,76.19 341.665,104.76 Q 363.6364,133.33 400,133.33 Q 363.6364,133.33 341.665,162.665 Q 319.6936,192 283.33,192 L 210,143.33 L 210,133.33 L 200 133.33 L 200 123.33 L 210 123.33 z" },
          { id: 7, d: "M 200,133.33 L 210,133.33 L 210,143.33 L 283.33,192 Q 283.33,228.3636 241.665,229.335 Q 200,230.3064 200,266.67 Q 200,230.3064 158.335,229.335 Q 116.67,228.3636 116.67,192 L 190,143.33 L 200,143.33 z" },
          { id: 4, d: "M 200,133.33 L 200,143.33 L 190,143.33 L 116.67,192 Q 80.3064,192 58.335,162.665 Q 36.3636,133.33 0,133.33 Q 36.3636,133.33 58.335,104.76 Q 80.3064,76.19 116.67,76.19 L 190,123.33 L 190,133.33 z" },
          { id: 12, d: "M 200,0 Q 200,36.3636 241.665,38.095 Q 283.33,39.8264 283.33,76.19 L 400, 0 z" },
          { id: 2, d: "M 116.67,76.19 Q 116.67,39.8264 158.335,38.095 Q 200,36.3636 200,0 L 0, 0 z" },
          { id: 3, d: "M 0,133.33 Q 36.3636,133.33 58.335,104.76 Q 80.3064,76.19 116.67,76.19 L 0, 0 z" },
          { id: 5, d: "M 116.67,192 Q 80.3064,192 58.335,162.665 Q 36.3636,133.33 0,133.33 L 0, 266.67 z" },
          { id: 6, d: "M 200,266.67 Q 200,230.3064 158.335,229.335 Q 116.67,228.3636 116.67,192 L 0, 266.67 z" },
          { id: 8, d: "M 283.33,192 Q 283.33,228.3636 241.665,229.335 Q 200,230.3064 200,266.67 L 400, 266.67 z" },
          { id: 9, d: "M 400,133.33 Q 363.6364,133.33 341.665,162.665 Q 319.6936,192 283.33,192 L 400, 266.67 z" },
          { id: 11, d: "M 283.33,76.19 Q 319.6936,76.19 341.665,104.76 Q 363.6364,133.33 400,133.33 L 400, 0 z" }
        ].map((path) => (
          <path
            key={path.id}
            d={path.d}
            fill={activeHouse === path.id ? 'rgba(255, 255, 255, 0.3)' : 'transparent'}
            stroke={theme.border}
            strokeWidth={activeHouse === path.id ? 3 : 1.5}
            className="cursor-pointer transition-all hover:fill-white/20 active:fill-white/40"
            onClick={(e) => {
              e.stopPropagation();
              onHouseSelect && onHouseSelect({
                house: path.id,
                sign: getSignForHouse(path.id),
                planets: groupedPlanets[path.id] || []
              });
            }}
          />
        ))}

        {/* Cross Lines (Center) */}
        <line stroke={theme.border} x1="190" y1="133.33" x2="210" y2="133.33"></line>
        <line stroke={theme.border} x1="200" y1="123.33" x2="200" y2="143.33"></line>

        {/* RASI NUMBERS (The Signs) */}
        {[...Array(12)].map((_, i) => {
          const houseNum = i + 1;
          const signNum = getSignForHouse(houseNum);
          const pos = houses[houseNum].sign;
          return (
            <text
              key={houseNum}
              x={pos.x}
              y={pos.y}
              fontSize="13"
              fontFamily="monospace"
              fill={theme.textMain}
              textAnchor="middle"
              dominantBaseline="middle"
              className="opacity-90 font-bold"
            >
              {signNum}
            </text>
          );
        })}

        {/* PLANETS */}
        {Object.keys(groupedPlanets).map((houseStr) => {
          const hNum = parseInt(houseStr);
          const planetsInHouse = groupedPlanets[hNum];
          const center = houses[hNum].center;

          // Adjust stacking for 400x266 scale
          return planetsInHouse.map((p, idx) => {
            // Stack vertically
            const yOffset = (idx - (planetsInHouse.length - 1) / 2) * 16;
            // Add retro indicator
            const retroMark = p.isRetro ? ' (R)' : '';
            return (
              <g key={idx}>
                <text
                  x={center.x}
                  y={center.y + yOffset}
                  fontSize="14"
                  fontWeight="normal"
                  fill={p.name === 'ल' ? "#000" : "#BB0000"} // Lagna Black, Planets Red/Brown
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="drop-shadow-sm cursor-default hover:font-bold"
                >
                  {p.name}{retroMark}
                </text>
              </g>
            );
          });
        })}
      </svg>
    </div>
  );
};

export default DynamicKundliChart;
