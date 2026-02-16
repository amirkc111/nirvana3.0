'use client';

import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import RealKundliForm from '../../components/RealKundliForm';
import RealVedicKundliDisplay from '../../components/RealVedicKundliDisplay';
import SectionHeading from '../../components/SectionHeading';
import Footer from '../../components/Footer';

export default function RealKundliFormPage() {
    const { t } = useLanguage();
    const { currentTheme } = useTheme();
    const [showForm, setShowForm] = useState(true);
    const [kundliData, setKundliData] = useState(null);
    const [activeService, setActiveService] = useState('create');

    const handleFormSubmit = (realKundliData) => {
        console.log('🔮 Real Kundli data received:', realKundliData);
        
        // Transform the real VedicJyotish data to match our display component format
        const transformedData = {
            name: realKundliData.name,
            birthData: realKundliData.birthData,
            planets: realKundliData.planets,
            divisionalCharts: realKundliData.divisionalCharts,
            panchanga: realKundliData.panchanga,
            houses: realKundliData.houses,
            ascendant: realKundliData.ascendant
        };
        
        setKundliData(transformedData);
        setShowForm(false);
    };

    const handleClose = () => {
        setShowForm(true);
        setKundliData(null);
    };

    const handleBackToForm = () => {
        setShowForm(true);
    };

    const services = [
        {
            id: 'create',
            title: 'Create Kundli',
            description: 'Generate your birth chart with VedicJyotish system',
            icon: '🔮'
        },
        {
            id: 'analysis',
            title: 'Kundli Analysis',
            description: 'Detailed analysis of your birth chart',
            icon: '📊'
        },
        {
            id: 'remedies',
            title: 'Astrological Remedies',
            description: 'Personalized remedies and solutions',
            icon: '🕉️'
        }
    ];

    const renderServiceContent = () => {
        switch (activeService) {
            case 'create':
                return showForm ? (
                    <RealKundliForm 
                        onClose={() => window.history.back()} 
                        onSubmit={handleFormSubmit}
                    />
                ) : (
                    <RealVedicKundliDisplay 
                        kundliData={kundliData} 
                        onClose={handleClose}
                        onBackToForm={handleBackToForm}
                    />
                );
            case 'analysis':
                return (
                    <div className={`${currentTheme.colors.surface} ${currentTheme.colors.border} border rounded-2xl p-8 text-center`}>
                        <div className="text-6xl mb-4">📊</div>
                        <h3 className={`text-2xl font-bold ${currentTheme.colors.text} mb-4`}>Kundli Analysis</h3>
                        <p className={`${currentTheme.colors.textSecondary} mb-6`}>
                            Upload your existing birth chart for detailed analysis and insights.
                        </p>
                        <div className="space-y-4">
                            <div className={`${currentTheme.colors.surface} border ${currentTheme.colors.border} rounded-lg p-4`}>
                                <h4 className={`font-semibold ${currentTheme.colors.text} mb-2`}>Upload Birth Chart</h4>
                                <input 
                                    type="file" 
                                    accept=".pdf,.jpg,.png" 
                                    className={`w-full p-3 ${currentTheme.colors.surface} border ${currentTheme.colors.border} rounded-lg ${currentTheme.colors.text}`}
                                />
                            </div>
                            <button className={`w-full py-3 px-6 rounded-lg bg-gradient-to-r ${currentTheme.colors.primary} text-white font-medium hover:opacity-90 transition-opacity`}>
                                Analyze Kundli
                            </button>
                        </div>
                    </div>
                );
            case 'remedies':
                return (
                    <div className="space-y-8">
                        {/* Header Section */}
                    <div className={`${currentTheme.colors.surface} ${currentTheme.colors.border} border rounded-2xl p-8 text-center`}>
                        <div className="text-6xl mb-4">🕉️</div>
                            <h3 className={`text-3xl font-bold ${currentTheme.colors.text} mb-4`}>Astrological Remedies</h3>
                            <p className={`${currentTheme.colors.textSecondary} mb-6 text-lg`}>
                                Discover powerful Vedic remedies for planetary afflictions and life challenges
                            </p>
                        </div>

                        {/* Main Categories Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Gemstone Recommendations */}
                            <div className={`${currentTheme.colors.surface} ${currentTheme.colors.border} border rounded-2xl p-6 hover:shadow-lg transition-all duration-300`}>
                                <div className="flex items-center mb-4">
                                    <div className="text-3xl mr-3">💎</div>
                                    <h4 className={`text-xl font-bold ${currentTheme.colors.text}`}>Gemstone Recommendations</h4>
                                </div>
                                <p className={`${currentTheme.colors.textSecondary} mb-4`}>
                                    Personalized gemstone suggestions based on your birth chart and planetary positions
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        <span className={`text-sm ${currentTheme.colors.text}`}>Ruby for Sun (Surya)</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                        <span className={`text-sm ${currentTheme.colors.text}`}>Pearl for Moon (Chandra)</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                        <span className={`text-sm ${currentTheme.colors.text}`}>Red Coral for Mars (Mangal)</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className={`text-sm ${currentTheme.colors.text}`}>Emerald for Mercury (Budha)</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        <span className={`text-sm ${currentTheme.colors.text}`}>Yellow Sapphire for Jupiter (Guru)</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                        <span className={`text-sm ${currentTheme.colors.text}`}>Diamond for Venus (Shukra)</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                        <span className={`text-sm ${currentTheme.colors.text}`}>Blue Sapphire for Saturn (Shani)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Mantra Chanting */}
                            <div className={`${currentTheme.colors.surface} ${currentTheme.colors.border} border rounded-2xl p-6 hover:shadow-lg transition-all duration-300`}>
                                <div className="flex items-center mb-4">
                                    <div className="text-3xl mr-3">🕉️</div>
                                    <h4 className={`text-xl font-bold ${currentTheme.colors.text}`}>Mantra Chanting</h4>
                                </div>
                                <p className={`${currentTheme.colors.textSecondary} mb-4`}>
                                    Specific mantras for planetary strength and dosh mitigation
                                </p>
                                <div className="space-y-3">
                                    <div className={`${currentTheme.colors.surface} border ${currentTheme.colors.border} rounded-lg p-3`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`font-semibold ${currentTheme.colors.text}`}>Sun (Surya)</span>
                                            <span className="text-xs text-orange-500">Sunday</span>
                                        </div>
                                        <p className={`text-xs ${currentTheme.colors.textSecondary}`}>Om Hraam Hreem Hraum Sah Suryaya Namah</p>
                                    </div>
                                    <div className={`${currentTheme.colors.surface} border ${currentTheme.colors.border} rounded-lg p-3`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`font-semibold ${currentTheme.colors.text}`}>Moon (Chandra)</span>
                                            <span className="text-xs text-blue-500">Monday</span>
                                        </div>
                                        <p className={`text-xs ${currentTheme.colors.textSecondary}`}>Om Shraam Shreem Shraum Sah Chandraya Namah</p>
                                    </div>
                                    <div className={`${currentTheme.colors.surface} border ${currentTheme.colors.border} rounded-lg p-3`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`font-semibold ${currentTheme.colors.text}`}>Mars (Mangal)</span>
                                            <span className="text-xs text-red-500">Tuesday</span>
                                        </div>
                                        <p className={`text-xs ${currentTheme.colors.textSecondary}`}>Om Kraam Kreem Kroum Sah Bhaumaya Namah</p>
                                    </div>
                                    <div className={`${currentTheme.colors.surface} border ${currentTheme.colors.border} rounded-lg p-3`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`font-semibold ${currentTheme.colors.text}`}>Jupiter (Guru)</span>
                                            <span className="text-xs text-yellow-500">Thursday</span>
                                        </div>
                                        <p className={`text-xs ${currentTheme.colors.textSecondary}`}>Om Graam Greem Graum Sah Gurave Namah</p>
                                    </div>
                                </div>
                            </div>

                            {/* Pooja Suggestions */}
                            <div className={`${currentTheme.colors.surface} ${currentTheme.colors.border} border rounded-2xl p-6 hover:shadow-lg transition-all duration-300`}>
                                <div className="flex items-center mb-4">
                                    <div className="text-3xl mr-3">🕯️</div>
                                    <h4 className={`text-xl font-bold ${currentTheme.colors.text}`}>Pooja Suggestions</h4>
                                </div>
                                <p className={`${currentTheme.colors.textSecondary} mb-4`}>
                                    Recommended poojas and rituals for your well-being and dosh mitigation
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="text-lg">🌞</div>
                                        <div>
                                            <span className={`font-semibold ${currentTheme.colors.text}`}>Sun Pooja</span>
                                            <p className={`text-xs ${currentTheme.colors.textSecondary}`}>Offer water to sun, recite Aditya Hridayam</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="text-lg">🌙</div>
                                        <div>
                                            <span className={`font-semibold ${currentTheme.colors.text}`}>Moon Pooja</span>
                                            <p className={`text-xs ${currentTheme.colors.textSecondary}`}>Worship Lord Shiva, offer white flowers</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="text-lg">🔥</div>
                                        <div>
                                            <span className={`font-semibold ${currentTheme.colors.text}`}>Mars Pooja</span>
                                            <p className={`text-xs ${currentTheme.colors.textSecondary}`}>Worship Lord Hanuman, recite Hanuman Chalisa</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="text-lg">🪐</div>
                                        <div>
                                            <span className={`font-semibold ${currentTheme.colors.text}`}>Jupiter Pooja</span>
                                            <p className={`text-xs ${currentTheme.colors.textSecondary}`}>Worship Lord Vishnu, chant Vishnu Sahasranamam</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="text-lg">🕉️</div>
                                        <div>
                                            <span className={`font-semibold ${currentTheme.colors.text}`}>Navagraha Shanti Pooja</span>
                                            <p className={`text-xs ${currentTheme.colors.textSecondary}`}>Comprehensive pooja for all nine planets</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Lucky Colors */}
                            <div className={`${currentTheme.colors.surface} ${currentTheme.colors.border} border rounded-2xl p-6 hover:shadow-lg transition-all duration-300`}>
                                <div className="flex items-center mb-4">
                                    <div className="text-3xl mr-3">🌈</div>
                                    <h4 className={`text-xl font-bold ${currentTheme.colors.text}`}>Lucky Colors</h4>
                                </div>
                                <p className={`${currentTheme.colors.textSecondary} mb-4`}>
                                    Colors that bring positive energy to your life based on Feng Shui and Vedic principles
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="text-center">
                                        <div className="w-8 h-8 bg-yellow-400 rounded-full mx-auto mb-2"></div>
                                        <span className={`text-xs ${currentTheme.colors.text}`}>Gold/Yellow</span>
                                        <p className={`text-xs ${currentTheme.colors.textSecondary}`}>Prosperity</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2"></div>
                                        <span className={`text-xs ${currentTheme.colors.text}`}>Green</span>
                                        <p className={`text-xs ${currentTheme.colors.textSecondary}`}>Growth</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-2"></div>
                                        <span className={`text-xs ${currentTheme.colors.text}`}>Red</span>
                                        <p className={`text-xs ${currentTheme.colors.textSecondary}`}>Energy</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2"></div>
                                        <span className={`text-xs ${currentTheme.colors.text}`}>Blue</span>
                                        <p className={`text-xs ${currentTheme.colors.textSecondary}`}>Peace</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-8 h-8 bg-purple-500 rounded-full mx-auto mb-2"></div>
                                        <span className={`text-xs ${currentTheme.colors.text}`}>Purple</span>
                                        <p className={`text-xs ${currentTheme.colors.textSecondary}`}>Wealth</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-8 h-8 bg-white border border-gray-300 rounded-full mx-auto mb-2"></div>
                                        <span className={`text-xs ${currentTheme.colors.text}`}>White</span>
                                        <p className={`text-xs ${currentTheme.colors.textSecondary}`}>Purity</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Graha Dosh Remedies Section */}
                        <div className={`${currentTheme.colors.surface} ${currentTheme.colors.border} border rounded-2xl p-6`}>
                            <div className="flex items-center mb-6">
                                <div className="text-3xl mr-3">🪐</div>
                                <h4 className={`text-2xl font-bold ${currentTheme.colors.text}`}>Graha Dosh Remedies</h4>
                            </div>
                            <p className={`${currentTheme.colors.textSecondary} mb-6`}>
                                Comprehensive remedies for planetary afflictions and doshas
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* General Remedies */}
                                <div className={`${currentTheme.colors.surface} border ${currentTheme.colors.border} rounded-lg p-4`}>
                                    <h5 className={`font-semibold ${currentTheme.colors.text} mb-3 flex items-center`}>
                                        <span className="text-lg mr-2">🌟</span>
                                        General Remedies
                                    </h5>
                                    <ul className={`text-sm ${currentTheme.colors.textSecondary} space-y-2`}>
                                        <li>• Maha Mrityunjaya Mantra</li>
                                        <li>• Navagraha Puja</li>
                                        <li>• Charity and Donations</li>
                                        <li>• Respecting Elders</li>
                                    </ul>
                                </div>

                                {/* Sacred Texts */}
                                <div className={`${currentTheme.colors.surface} border ${currentTheme.colors.border} rounded-lg p-4`}>
                                    <h5 className={`font-semibold ${currentTheme.colors.text} mb-3 flex items-center`}>
                                        <span className="text-lg mr-2">📖</span>
                                        Sacred Texts
                                    </h5>
                                    <ul className={`text-sm ${currentTheme.colors.textSecondary} space-y-2`}>
                                        <li>• Hanuman Chalisa</li>
                                        <li>• Vishnu Sahasranamam</li>
                                        <li>• Gayatri Mantra</li>
                                        <li>• Aditya Hridayam Stotra</li>
                                    </ul>
                                </div>

                                {/* Lifestyle Changes */}
                            <div className={`${currentTheme.colors.surface} border ${currentTheme.colors.border} rounded-lg p-4`}>
                                    <h5 className={`font-semibold ${currentTheme.colors.text} mb-3 flex items-center`}>
                                        <span className="text-lg mr-2">🌱</span>
                                        Lifestyle Changes
                                    </h5>
                                    <ul className={`text-sm ${currentTheme.colors.textSecondary} space-y-2`}>
                                        <li>• Daily Mantra Chanting</li>
                                        <li>• Regular Pooja Practice</li>
                                        <li>• Meditation and Yoga</li>
                                        <li>• Positive Thinking</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Call to Action */}
                        <div className={`${currentTheme.colors.surface} ${currentTheme.colors.border} border rounded-2xl p-6 text-center`}>
                            <h4 className={`text-xl font-bold ${currentTheme.colors.text} mb-3`}>Need Personalized Guidance?</h4>
                            <p className={`${currentTheme.colors.textSecondary} mb-4`}>
                                Chat with our AI astrologer for specific remedies tailored to your birth chart
                            </p>
                            <button 
                                onClick={() => {
                                    // Scroll to chat widget or open chat
                                    const chatButton = document.querySelector('[data-chat-button]');
                                    if (chatButton) chatButton.click();
                                }}
                                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Chat with AI Astrologer
                            </button>
                        </div>
                    </div>
                );
            default:
                return showForm ? (
                    <RealKundliForm 
                        onClose={() => window.history.back()} 
                        onSubmit={handleFormSubmit}
                    />
                ) : (
                    <RealVedicKundliDisplay 
                        kundliData={kundliData} 
                        onClose={handleClose}
                        onBackToForm={handleBackToForm}
                    />
                );
        }
    };

    return (
        <div className="min-h-screen pt-20">
            {/* Header */}
            <section className="py-8 sm:py-12">
                <div className="container mx-auto px-4">
                    <SectionHeading
                        eyebrow="VedicJyotish System"
                        title="Advanced Kundli Services"
                        subtitle="Professional astrological calculations powered by Swiss Ephemeris and VedicJyotish system"
                    />
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-4">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                        {services.map((service) => (
                            <div
                                key={service.id}
                                onClick={() => {
                                    setActiveService(service.id);
                                    if (service.id === 'create') {
                                        setShowForm(true);
                                        setKundliData(null);
                                    }
                                }}
                                className={`cursor-pointer transition-all duration-300 ${
                                    activeService === service.id
                                        ? `${currentTheme.colors.surface} border-2 ${currentTheme.colors.primary} border-opacity-50`
                                        : `${currentTheme.colors.surface} border ${currentTheme.colors.border} hover:${currentTheme.colors.hover}`
                                } rounded-lg p-4 text-center`}
                            >
                                <div className="text-3xl mb-2">{service.icon}</div>
                                <h3 className={`text-lg font-bold ${currentTheme.colors.text}`}>
                                    {service.title}
                                </h3>
                                <p className={`text-sm ${currentTheme.colors.textSecondary} mt-1`}>
                                    {service.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Service Content */}
            <section className="py-8">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        {renderServiceContent()}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}
