import { DateTime } from "luxon";
import { DasaTable } from "src/components/DasaTable";
import { calcVimsottariDasa } from "src/services/calcVimsottariDasa";
import type { KundliData } from "src/services/Kundli";

export default function VimsottariDasa({
    kundliData,
}: {
    kundliData: KundliData;
}) {
    const now = DateTime.now();
    const dasaData = calcVimsottariDasa(
        kundliData.panchanga.tjd_ut,
        kundliData.planets.Moon.nakshatra,
        kundliData.panchanga.datetime
    );
    const mahadasa = dasaData.filter(
        d => d.StartDate <= now && now <= d.EndDate
    )[0];

    const antardasha = mahadasa.ChildDasha.filter(
        d => d.StartDate <= now && now <= d.EndDate
    )[0];

    // const pratyantardasha = antardasha.ChildDasha.filter(
    //     d => d.StartDate <= now && now <= d.EndDate
    // )[0];

    // const sookshmadasha = pratyantardasha.ChildDasha.filter(
    //     d => d.StartDate <= now && now <= d.EndDate
    // )[0];

    // const praanadasha = sookshmadasha.ChildDasha.filter(
    //     d => d.StartDate <= now && now <= d.EndDate
    // )[0];

    // const dehadasha = praanadasha.ChildDasha.filter(
    //     d => d.StartDate <= now && now <= d.EndDate
    // )[0];

    return (
        <section className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                    Vimsottari Dasha
                </h2>
            </div>
            
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 mb-6 border border-emerald-200">
                <p className="text-emerald-800 text-sm font-medium">
                    ⏰ Planetary periods and their effects on your life journey
                </p>
            </div>

            <div className="space-y-6">
                {/* Maha Dasa */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800">Maha Dasa</h3>
                    </div>
                    <DasaTable dasa={mahadasa} />
                </div>

                {/* Antar Dasa */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800">Antar Dasa</h3>
                    </div>
                    <DasaTable dasa={antardasha} />
                </div>
            </div>
        </section>
    );
}
