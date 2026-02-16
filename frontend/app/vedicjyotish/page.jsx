'use client';

import { useEffect, useState } from 'react';
import { extractKundliDataFromPage, saveKundliToDatabase } from '../../lib/kundliDataExtractor';

export default function VedicJyotishPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [urlParams, setUrlParams] = useState('');
    const [saveStatus, setSaveStatus] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Set body data attribute for CSS targeting
        document.body.setAttribute('data-pathname', '/vedicjyotish');
        document.body.classList.add('vedicjyotish-page');

        // Extract URL parameters and pass them to the embedded VedicJyotish app
        const params = new URLSearchParams(window.location.search);
        const vedicJyotishParams = new URLSearchParams({
            page: 'KundliResult',
            name: params.get('name') || 'aayan',
            date: params.get('date') || '2017-11-17',
            time: params.get('time') || '11:15:00',
            lat: params.get('lat') || '27.7172',
            lon: params.get('lon') || '85.324',
            tz: params.get('tznm') || '5.75',
            tznm: params.get('tznm') || '5.75',
            city: params.get('city') || 'Kathmandu',
            ayan: 'lahiri'
        });

        setUrlParams(vedicJyotishParams.toString());

        // Simulate loading
        setTimeout(() => {
            setLoading(false);
        }, 1000);

        // Cleanup on unmount
        return () => {
            document.body.removeAttribute('data-pathname');
            document.body.classList.remove('vedicjyotish-page');
        };
    }, []);

    const handleSaveKundli = async () => {
        setIsSaving(true);
        setSaveStatus('Extracting & Saving Kundli data...');

        try {
            // Use the shared robust extractor
            const kundliData = extractKundliDataFromPage();

            if (!kundliData) {
                throw new Error("Failed to extract data from the page.");
            }

            // Fallback for name/date if extractor missed them (it tries DOM first, then fallback to empty)
            // The extractor already tries DOM. We can enhance if needed, but let's trust it for now 
            // or pass URL params if needed. The extractor does check URL params at the end.

            // Call the save API
            const result = await saveKundliToDatabase(kundliData);

            if (result.success) {
                setSaveStatus('✅ ' + (result.data.message || 'Saved successfully'));
            } else {
                setSaveStatus('❌ ' + (result.error || 'Failed to save'));
            }
        } catch (error) {
            setSaveStatus('❌ Error: ' + error.message);
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-xl">Loading VedicJyotish Application...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 vedicjyotish-page">

            {/* Save Button */}
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                background: 'white',
                color: '#374151',
                padding: '8px',
                borderRadius: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb',
                zIndex: 99999,
                fontFamily: 'Arial, sans-serif'
            }}>
                <button
                    onClick={handleSaveKundli}
                    disabled={isSaving}
                    style={{
                        padding: '8px 12px',
                        background: isSaving ? '#9ca3af' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                        fontWeight: '500',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {isSaving ? 'Saving...' : 'Save'}
                </button>
                {saveStatus && (
                    <div style={{
                        marginTop: '6px',
                        fontSize: '10px',
                        textAlign: 'center',
                        color: saveStatus.includes('✅') ? '#059669' : '#dc2626',
                        backgroundColor: saveStatus.includes('✅') ? '#d1fae5' : '#fee2e2',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: `1px solid ${saveStatus.includes('✅') ? '#a7f3d0' : '#fecaca'}`
                    }}>
                        {saveStatus}
                    </div>
                )}
            </div>

            {/* Embed VedicJyotish Application */}
            <iframe
                src={`/VedicJyotish/dist/index.html?${urlParams}&v=3&nocache=${Date.now()}`}
                style={{
                    width: '100%',
                    height: '100vh',
                    border: 'none',
                    marginTop: '0px',
                    position: 'relative',
                    top: '0px'
                }}
                title="VedicJyotish Application"
                scrolling="yes"
            />

        </div>
    );
}
