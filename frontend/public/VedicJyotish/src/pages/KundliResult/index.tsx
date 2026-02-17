import { DateTime } from "luxon";
import ChartInfoTable from "src/components/ChartInfoTable";
import KundliChartSVG from "src/components/KundliChartSVG";
import KundliYogPhala from "src/components/KundliYogPhala";
import VimsottariDasa from "src/components/VimsottariDasa";
import { useSessionContext } from "src/contexts/SessionContext";
import { Kundli } from "src/services/Kundli";
import { DMS } from "src/services/utils";

export default function KundliResult() {
    const session = useSessionContext();

    const kundliData = Kundli(
        DateTime.fromISO(`${session.data.date}T${session.data.time}`, {
            zone: session.data.tznm,
        }) as DateTime<true>,
        session.data.lon,
        session.data.lat
    );

    return (
        <div id="phaladesh-page">
            <div className="container mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="mb-8 text-center">
                    <div className="mb-4">
                        <img 
                            src="assets/icon/logo.png" 
                            alt="Nirvana Astro" 
                            className="mx-auto h-16 w-16 rounded-full shadow-lg object-contain"
                        />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Nirvana Astro
                    </h1>
                    <p className="text-xl text-gray-600 mb-4">
                        Professional Astrology & Birth Chart Analysis
                    </p>
                    <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"></div>
                </div>

                <div className="space-y-8">
                    {/* Basic Birth Details Section */}
                    <section className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center mb-6">
                            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mr-4">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                Basic Birth Details
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center mb-2">
                                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="font-semibold text-gray-700">Birth Date & Time</span>
                                </div>
                                <p className="text-gray-600 text-sm">{kundliData.datetime.toFormat('dd MMMM yyyy, hh:mm a')}</p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center mb-2">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-9 0a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M7 4a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                                    </svg>
                                    <span className="font-semibold text-gray-700">Weekday</span>
                                </div>
                                <p className="text-gray-600 text-sm">{kundliData.panchanga.vara.name.hindi}</p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center mb-2">
                                    <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <span className="font-semibold text-gray-700">Day Birth</span>
                                </div>
                                <p className="text-gray-600 text-sm">{kundliData.daybirth ? 'Yes' : 'No'}</p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center mb-2">
                                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="font-semibold text-gray-700">Latitude</span>
                                </div>
                                <p className="text-gray-600 text-sm">{DMS(kundliData.panchanga.latitude).toString()}</p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center mb-2">
                                    <svg className="w-5 h-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="font-semibold text-gray-700">Longitude</span>
                                </div>
                                <p className="text-gray-600 text-sm">{DMS(kundliData.panchanga.longitude).toString()}</p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center mb-2">
                                    <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <span className="font-semibold text-gray-700">Ayanamsa</span>
                                </div>
                                <p className="text-gray-600 text-sm">{DMS(kundliData.panchanga.ayanamsa).toString()}</p>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-200">
                                <div className="flex items-center mb-2">
                                    <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <span className="font-semibold text-gray-700">Sunrise</span>
                                </div>
                                <p className="text-gray-600 text-sm">{kundliData.panchanga.sunrise.dt.toFormat('hh:mm a')}</p>
                            </div>

                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                                <div className="flex items-center mb-2">
                                    <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                    <span className="font-semibold text-gray-700">Sunset</span>
                                </div>
                                <p className="text-gray-600 text-sm">{kundliData.panchanga.sunset.dt.toFormat('hh:mm a')}</p>
                            </div>
                        </div>
                    </section>

                    {/* Information Chart Section */}
                    <section className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center mb-6">
                            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg mr-4">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                Planetary Information Chart
                            </h2>
                        </div>
                        
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-200">
                            <p className="text-blue-800 text-sm font-medium">
                                📊 Complete planetary positions with degrees, Rasi, Nakshatra, and their lords
                            </p>
                        </div>
                        
                        <ChartInfoTable grahaData={kundliData.planets} />
                    </section>

                    {/* Birth Charts Section */}
                    <section className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center mb-6">
                            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg mr-4">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                Birth Charts
                            </h2>
                        </div>
                        
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6 border border-purple-200">
                            <p className="text-purple-800 text-sm font-medium">
                                🔮 Multiple divisional charts showing different aspects of your astrological profile
                            </p>
                        </div>

                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {/* Ascendant Chart */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">Ascendant Chart</h3>
                                <div className="flex justify-center">
                                    <KundliChartSVG
                                        chartData={Object.values(kundliData.planets).map(
                                            planet => ({
                                                planet_name: planet.name.english,
                                                degree: planet.rasi.degree,
                                                rasi_num: planet.rasi.rasi_num,
                                            })
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Hora Chart */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">Hora Chart</h3>
                                <div className="flex justify-center">
                                    <KundliChartSVG
                                        chartData={Object.values(kundliData.planets).map(
                                            planet => ({
                                                planet_name: planet.name.english,
                                                degree: planet.divisional.hora.degree,
                                                rasi_num: planet.divisional.hora.rasi_num,
                                            })
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Shashthamsa Chart */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">Shashthamsa Chart</h3>
                                <div className="flex justify-center">
                                    <KundliChartSVG
                                        chartData={Object.values(kundliData.planets).map(
                                            planet => ({
                                                planet_name: planet.name.english,
                                                degree: planet.divisional.shashtamsa.degree,
                                                rasi_num: planet.divisional.shashtamsa.rasi_num,
                                            })
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Ashthamsa Chart */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">Ashthamsa Chart</h3>
                                <div className="flex justify-center">
                                    <KundliChartSVG
                                        chartData={Object.values(kundliData.planets).map(
                                            planet => ({
                                                planet_name: planet.name.english,
                                                degree: planet.divisional.ashtamsa.degree,
                                                rasi_num: planet.divisional.ashtamsa.rasi_num,
                                            })
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Navamsa Chart */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">Navamsa Chart</h3>
                                <div className="flex justify-center">
                                    <KundliChartSVG
                                        chartData={Object.values(kundliData.planets).map(
                                            planet => ({
                                                planet_name: planet.name.english,
                                                degree: planet.divisional.navamsa.degree,
                                                rasi_num: planet.divisional.navamsa.rasi_num,
                                            })
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <KundliYogPhala kundliData={kundliData} />

                    <VimsottariDasa kundliData={kundliData} />
                </div>
            </div>
        </div>
    );
}
