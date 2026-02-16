'use client';

import { useState } from 'react';
import KundliForm from './KundliForm';
import VedicKundliDisplay from './VedicKundliDisplay';

const KundliWrapper = () => {
    const [showForm, setShowForm] = useState(true);
    const [birthData, setBirthData] = useState(null);

    const handleFormSubmit = (formData) => {
        console.log('Form submitted with data:', formData);
        setBirthData(formData);
        setShowForm(false);
    };

    const handleClose = () => {
        setShowForm(true);
        setBirthData(null);
    };

    const handleBackToForm = () => {
        setShowForm(true);
    };

    return (
        <>
            {showForm ? (
                <KundliForm 
                    onClose={() => window.history.back()} 
                    onSubmit={handleFormSubmit}
                />
            ) : (
                <VedicKundliDisplay 
                    birthData={birthData} 
                    onClose={handleClose}
                    onBackToForm={handleBackToForm}
                />
            )}
        </>
    );
};

export default KundliWrapper;
