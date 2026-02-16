'use client';

import { useEffect, useRef } from 'react';

// Simplified KundliChartSVG component that uses our existing KundaliSVG
const KundliChartSVG = ({ chartData, chartSetting = {} }) => {
    const chartRef = useRef(null);
    const chartId = useRef(`chart-${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
        console.log('🔍 KundliChartSVG useEffect triggered');
        console.log('chartData:', chartData);
        console.log('chartRef.current:', chartRef.current);
        console.log('chartId.current:', chartId.current);
        
        if (chartData && chartRef.current) {
            let timeoutId;
            
            const drawChart = () => {
                console.log('🎯 drawChart called');
                console.log('window.KundaliSVG:', window.KundaliSVG);
                
                if (window.KundaliSVG) {
                    try {
                        // Clear any existing content
                        const container = document.getElementById(chartId.current);
                        console.log('📦 Container found:', container);
                        
                        if (container) {
                            container.innerHTML = '';
                            console.log('🧹 Container cleared');
                        }
                        
                        // Convert chartData to KundaliSVG format
                        const planetNameMap = {
                            'Sun': 'sun',
                            'Moon': 'moon', 
                            'Mars': 'mars',
                            'Mercury': 'mercury',
                            'Jupiter': 'jupiter',
                            'Venus': 'venus',
                            'Saturn': 'saturn',
                            'Rahu': 'rahu',
                            'Ketu': 'ketu',
                            'Ascendant': 'ascendant'
                        };
                        
                        const planetsData = chartData.map(planet => ({
                            id: planetNameMap[planet.planet_name] || planet.planet_name.toLowerCase(),
                            longitude: planet.degree,
                            name: planet.planet_name,
                            degrees: planet.degree,
                            retrograde: false
                        }));
                        
                        console.log('🪐 Planets data:', planetsData);

                        // Create new KundaliSVG instance
                        console.log('🏗️ Creating KundaliSVG instance for ID:', chartId.current);
                        const chart = new window.KundaliSVG(chartId.current);
                        
                        // Check if chart was created successfully
                        if (!chart || !chart.svg) {
                            console.error('❌ KundaliSVG instance failed to create or find SVG element');
                            console.error('❌ Looking for element with ID:', chartId.current);
                            console.error('❌ Element exists:', !!document.getElementById(chartId.current));
                            return;
                        }
                        
                        console.log('✅ KundaliSVG instance created, SVG element:', chart.svg);
                        
                        // Draw the chart
                        console.log('🎨 Drawing chart...');
                        chart.drawKundali(planetsData, 25.15); // Default ascendant
                        
                        // Check if SVG was created
                        const svgElement = document.querySelector(`#${chartId.current} svg`);
                        console.log('📊 SVG element after drawing:', svgElement);
                        console.log('📊 SVG innerHTML length:', svgElement ? svgElement.innerHTML.length : 'No SVG found');
                        
                        // Also check the container content
                        console.log('📦 Container innerHTML length:', container ? container.innerHTML.length : 'No container found');
                        console.log('📦 Container children count:', container ? container.children.length : 'No container found');
                        
                        console.log('✅ Chart drawn successfully:', chartId.current);
                    } catch (error) {
                        console.error('❌ Error drawing chart:', error);
                        console.error('❌ Error details:', error.message, error.stack);
                    }
                } else {
                    // Wait for KundaliSVG to be available
                    console.log('⏳ Waiting for KundaliSVG to be available...');
                    timeoutId = setTimeout(drawChart, 100);
                }
            };
            
            drawChart();
            
            // Cleanup timeout on unmount
            return () => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
            };
        } else {
            console.log('❌ Missing requirements:', {
                chartData: !!chartData,
                chartRef: !!chartRef.current
            });
        }
    }, [chartData]);

        return (
            <div className="w-full h-80 flex items-center justify-center border-2 border-red-500">
                <svg 
                    ref={chartRef} 
                    id={chartId.current} 
                    width={chartSetting.width || 400} 
                    height={chartSetting.height || 400}
                    viewBox="0 0 300 300"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <text x="150" y="150" textAnchor="middle" fill="#666">Loading chart...</text>
                </svg>
            </div>
        );
};

export default KundliChartSVG;
