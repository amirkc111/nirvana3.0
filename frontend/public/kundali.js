/**
 * Represents a North Indian style Kundali (astrological chart) in SVG.
 * This version matches the exact design from VedicJyotish reference.
 */
class KundaliSVG {
    constructor(svgId, config = {}) {
        this.svg = document.getElementById(svgId);
        if (!this.svg) {
            console.error(`SVG element with ID "${svgId}" not found.`);
            return;
        }

        // Default configuration
        const defaults = {
            padding: 0,
            ascendantMarker: "लग्न",
            planetConfig: {
                sun: { name: "सूर्य", color: "#f39c12" },
                moon: { name: "चंद्र", color: "#5dade2" },
                mars: { name: "मंगल", color: "#e74c3c" },
                mercury: { name: "बुध", color: "#27ae60" },
                jupiter: { name: "गुरु", color: "#b7950b" },
                venus: { name: "शुक्र", color: "#ff69b4" },
                saturn: { name: "शनि", color: "#5d6d7e" },
                rahu: { name: "राहु", color: "#7f8c8d" },
                ketu: { name: "केतु", color: "#d35400" },
                ascendant: { name: "लग्न", color: "#1e90ff" }
            }
        };

        this.config = { ...defaults, ...config };
        this.currentPlanetsData = [];
        this.ascendantLongitude = 0;
        this.selectedPlanetId = null;
    }

    _createSVGElement(tag, attributes = {}) {
        const element = document.createElementNS(
            "http://www.w3.org/2000/svg",
            tag
        );
        for (const key in attributes) {
            element.setAttribute(key, attributes[key]);
        }
        return element;
    }

    _drawKundaliGrid() {
        const gridGroup = this._createSVGElement("g", {
            class: "kundali-grid",
        });
        this.svg.appendChild(gridGroup);

        // Draw the exact polyline structure from the original
        const polylines = [
            // Main diamond structure
            { points: "150,0 225,75 150,150 75,75 150,0", fill: "#fff", stroke: "#b78b03" },
            { points: "0,150 75,75 150,150 75,225 0,150", fill: "#fff", stroke: "#b78b03" },
            { points: "75,225 150,150 225,225 150,300 75,225", fill: "#fff", stroke: "#b78b03" },
            { points: "150,150 225,75 300,150 225,225 150,150", fill: "#fff", stroke: "#b78b03" },
            // Outer triangles
            { points: "0,0 150,0 75,75 0,0", fill: "#fdf7e3", stroke: "#b78b03" },
            { points: "0,0 75,75 0,150 0,0", fill: "#fdf7e3", stroke: "#b78b03" },
            { points: "0,150 75,225 0,300 0,150", fill: "#fdf7e3", stroke: "#b78b03" },
            { points: "0,300 75,225 150,300 0,300", fill: "#fdf7e3", stroke: "#b78b03" },
            { points: "150,300 225,225 300,300 150,300", fill: "#fdf7e3", stroke: "#b78b03" },
            { points: "225,225 300,150 300,300 225,225", fill: "#fdf7e3", stroke: "#b78b03" },
            { points: "225,75 300,0 300,150 225,75", fill: "#fdf7e3", stroke: "#b78b03" },
            { points: "150,0 225,75 300,0 150,0", fill: "#fdf7e3", stroke: "#b78b03" }
        ];

        polylines.forEach(polyline => {
            gridGroup.appendChild(this._createSVGElement("polyline", {
                points: polyline.points,
                fill: polyline.fill,
                stroke: polyline.stroke,
                "stroke-width": "1"
            }));
        });
    }

    _drawHouseLabels() {
        const labelGroup = this._createSVGElement("g", {
            class: "kundali-house-labels",
        });
        this.svg.appendChild(labelGroup);

        // House number positions matching the original exactly
        const housePositions = [
            { x: 150, y: 138, number: 10 }, // Top-center
            { x: 75, y: 63, number: 11 },   // Top-left
            { x: 63, y: 75, number: 12 },   // Left-top
            { x: 138, y: 150, number: 1 },  // Center-top
            { x: 63, y: 225, number: 2 },   // Left-bottom
            { x: 75, y: 237, number: 3 },   // Bottom-left
            { x: 150, y: 162, number: 4 },  // Bottom-center
            { x: 225, y: 237, number: 5 },  // Bottom-right
            { x: 237, y: 225, number: 6 },  // Right-bottom
            { x: 162, y: 150, number: 7 },  // Center-bottom
            { x: 237, y: 75, number: 8 },   // Right-top
            { x: 225, y: 63, number: 9 }    // Top-right
        ];

        housePositions.forEach(pos => {
            const textElement = this._createSVGElement("text", {
                x: pos.x,
                y: pos.y,
                "text-anchor": "middle",
                "alignment-baseline": "central",
                fill: "#489624",
                "font-size": "12",
                "font-weight": "bold"
            });
            textElement.textContent = pos.number;
            labelGroup.appendChild(textElement);
        });
    }

    _drawPlanets(planetsData) {
        if (!planetsData || !Array.isArray(planetsData)) return;

        const planetGroup = this._createSVGElement("g", {
            class: "kundali-planets",
        });
        this.svg.appendChild(planetGroup);

        // Group planets by house
        const planetsByHouse = {};
        planetsData.forEach(planet => {
            const house = this._getHouseFromLongitude(planet.longitude);
            if (!planetsByHouse[house]) {
                planetsByHouse[house] = [];
            }
            planetsByHouse[house].push(planet);
        });

        // Draw planets in each house using grid layout (like original VedicJyotish)
        Object.entries(planetsByHouse).forEach(([house, planets]) => {
            const housePos = this._getHousePosition(parseInt(house));
            if (!housePos) return;

            const totalInHouse = planets.length;
            const maxPerRow = 3;
            const horizontalSpacing = 24;
            const verticalSpacing = 24;

            console.log(`🏠 House ${house}: ${totalInHouse} planets at position (${housePos.x}, ${housePos.y})`);

            planets.forEach((planet, index) => {
                const planetConfig = this.config.planetConfig[planet.id.toLowerCase()] ||
                    this.config.planetConfig.ascendant;

                let coords = { x: housePos.x, y: housePos.y };
                let row = 0, col = 0; // Initialize for single planet case

                // Apply grid layout for multiple planets (like original VedicJyotish)
                if (totalInHouse > 1) {
                    row = Math.floor(index / maxPerRow);
                    col = index % maxPerRow;
                    const numInThisRow = Math.min(totalInHouse - row * maxPerRow, maxPerRow);
                    const totalRowWidth = (numInThisRow - 1) * horizontalSpacing;
                    coords.x = coords.x - totalRowWidth / 2 + col * horizontalSpacing;
                    const totalBlockHeight = (Math.ceil(totalInHouse / maxPerRow) - 1) * verticalSpacing;
                    coords.y = coords.y - totalBlockHeight / 2 + row * verticalSpacing;
                }

                console.log(`  📍 Planet ${planet.name} (row ${row}, col ${col}): position (${coords.x}, ${coords.y})`);

                const group = this._createSVGElement("g", {
                    transform: `translate(${coords.x}, ${coords.y})`,
                    class: "planet-group"
                });

                const textElement = this._createSVGElement("text", {
                    "text-anchor": "middle",
                    "alignment-baseline": "central",
                    x: 0,
                    y: 0
                });

                const planetName = planet.retrograde ? planetConfig.name + "*" : planetConfig.name;

                textElement.innerHTML = `<tspan x="0" dy="0" font-size="14" fill="${planetConfig.color}">${planetName}</tspan>`;

                group.appendChild(textElement);
                planetGroup.appendChild(group);
            });
        });
    }

    _getHouseFromLongitude(longitude) {
        // Use the exact same house calculation as original VedicJyotish
        const houseNum = 1 + ((12 - Math.floor(this.ascendantLongitude / 30) + Math.floor(longitude / 30)) % 12);
        return houseNum;
    }

    _getHousePosition(houseNumber) {
        // Calculate positions based on original VedicJyotish geometric system
        // For 300x300 chart with 30px padding
        const center = { x: 150, y: 150 };
        const outerDiamond = [
            { x: 150, y: 30 },   // Top
            { x: 270, y: 150 },  // Right  
            { x: 150, y: 270 },  // Bottom
            { x: 30, y: 150 }    // Left
        ];
        const innerDiamond = [
            { x: 210, y: 90 },   // Top-Right
            { x: 210, y: 210 },  // Bottom-Right
            { x: 90, y: 210 },   // Bottom-Left
            { x: 90, y: 90 }     // Top-Left
        ];

        const labelOffset = 15; // Half of original 30
        const planetCenterOffsetV = 7.5; // Half of original 15
        const planetCenterOffsetH = 2.5; // Half of original 5

        let points = { x: 0, y: 0 };

        switch (houseNumber) {
            case 1: // Top triangle
                points = {
                    x: center.x,
                    y: (outerDiamond[0].y + innerDiamond[3].y) / 2 + planetCenterOffsetV
                };
                break;
            case 2: // Top-left triangle
                points = {
                    x: innerDiamond[3].x,
                    y: (outerDiamond[0].y + innerDiamond[3].y) / 2
                };
                break;
            case 3: // Left-top triangle
                points = {
                    x: (outerDiamond[3].x + innerDiamond[3].x) / 2 - planetCenterOffsetH,
                    y: (outerDiamond[3].y + outerDiamond[0].y + innerDiamond[3].y) / 3
                };
                break;
            case 4: // Left triangle
                points = {
                    x: (outerDiamond[3].x + innerDiamond[2].x + innerDiamond[3].x) / 3 + planetCenterOffsetH,
                    y: center.y
                };
                break;
            case 5: // Left-bottom triangle
                points = {
                    x: (outerDiamond[3].x + innerDiamond[3].x) / 2 - planetCenterOffsetH,
                    y: (outerDiamond[1].y + outerDiamond[2].y) / 2
                };
                break;
            case 6: // Bottom-left triangle
                points = {
                    x: (outerDiamond[2].x + outerDiamond[3].x + innerDiamond[2].x) / 3 - planetCenterOffsetH,
                    y: (outerDiamond[2].y + innerDiamond[2].y) / 2
                };
                break;
            case 7: // Bottom triangle
                points = {
                    x: center.x,
                    y: (outerDiamond[2].y + innerDiamond[1].y + innerDiamond[2].y) / 3 - planetCenterOffsetV
                };
                break;
            case 8: // Bottom-right triangle
                points = {
                    x: (outerDiamond[0].x + outerDiamond[1].x) / 2,
                    y: (outerDiamond[2].y + innerDiamond[1].y) / 2 - planetCenterOffsetV
                };
                break;
            case 9: // Right-bottom triangle
                points = {
                    x: (outerDiamond[1].x + innerDiamond[1].x) / 2 - planetCenterOffsetH,
                    y: (outerDiamond[1].y + outerDiamond[2].y + innerDiamond[1].y) / 3
                };
                break;
            case 10: // Right triangle
                points = {
                    x: (outerDiamond[1].x + innerDiamond[0].x + innerDiamond[1].x) / 3 - planetCenterOffsetH,
                    y: center.y
                };
                break;
            case 11: // Right-top triangle
                points = {
                    x: (outerDiamond[1].x + innerDiamond[1].x) / 2 - planetCenterOffsetH,
                    y: innerDiamond[0].y
                };
                break;
            case 12: // Top-right triangle
                points = {
                    x: (outerDiamond[1].x + center.x) / 2 + planetCenterOffsetH,
                    y: (outerDiamond[0].y + innerDiamond[3].y) / 2
                };
                break;
            default:
                points = center;
        }

        return points;
    }

    drawKundali(planetsData, ascendantLongitude) {
        if (!this.svg) return;
        if (!planetsData || !Array.isArray(planetsData)) {
            console.error("Invalid planetsData passed to drawKundali.");
            return;
        }
        if (isNaN(ascendantLongitude)) {
            console.error("Invalid ascendantLongitude passed to drawKundali.");
            return;
        }

        this.currentPlanetsData = planetsData;
        this.ascendantLongitude = ascendantLongitude;

        this.svg.innerHTML = ""; // Clear everything
        this.svg.setAttribute("width", "300");
        this.svg.setAttribute("height", "300");
        this.svg.setAttribute("viewBox", "-2.4 -2.4 304.8 304.8");
        this.svg.setAttribute("shape-rendering", "geometricPrecision");
        this.svg.setAttribute("text-rendering", "geometricPrecision");
        this.svg.setAttribute("image-rendering", "optimizeQuality");
        this.svg.setAttribute("fill-rule", "evenodd");
        this.svg.setAttribute("clip-rule", "evenodd");

        // Draw components
        this._drawKundaliGrid();
        this._drawHouseLabels();
        this._drawPlanets(planetsData);
    }
}

// Make KundaliSVG available globally
if (typeof window !== 'undefined') {
    window.KundaliSVG = KundaliSVG;
    console.log('✅ KundaliSVG class exposed to global scope');
}