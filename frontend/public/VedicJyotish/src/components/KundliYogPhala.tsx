import type { KundliData } from "src/services/Kundli";
import { calcYogPhala } from "src/services/YogPhala";

export default function KundliYogPhala({
    kundliData,
}: {
    kundliData: KundliData;
}) {
    const yogPhala = calcYogPhala(kundliData.planets);
    return (
        <section className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                    Yoga Phala
                </h2>
            </div>
            
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 mb-6 border border-indigo-200">
                <p className="text-indigo-800 text-sm font-medium">
                    🔮 Astrological interpretations and predictions based on planetary positions and combinations
                </p>
            </div>

            <div className="space-y-6">
                {Object.entries(yogPhala).map(([source, phalas]) => {
                    if (!phalas || phalas.length === 0) return null;

                    return (
                        <div key={source} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                            <div className="flex items-center mb-4">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800">
                                    {source}
                                </h3>
                            </div>
                            
                            <div className="space-y-3">
                                {phalas.map(({ description, effect }, index) => (
                                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-100 hover:shadow-md transition-shadow">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                                                <span className="text-blue-600 text-xs font-semibold">{index + 1}</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-800 leading-relaxed">
                                                    <span className="font-medium text-gray-900">{description.hindi}</span>
                                                    <span className="mx-2 text-blue-500">➡</span>
                                                    <span className="text-gray-700">{effect.hindi}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
