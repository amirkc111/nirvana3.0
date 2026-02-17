import type { Planet, PlanetEn } from "src/services/constants/Planet";
import { DMS } from "src/services/utils";

interface Props {
    grahaData: Record<PlanetEn, Planet>;
}

export default function ChartInfoTable({ grahaData }: Props) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                        {[
                            "Planets",
                            "Positions",
                            "Degrees",
                            "Rasi",
                            "Rasi Lord",
                            "Nakshatra",
                            "Nakshatra Lord",
                        ].map((head, index) => (
                            <th key={index} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                                {head}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Object.values(grahaData).map((planet, index) => {
                        const isEven = index % 2 === 0;
                        return (
                            <tr key={planet.name.english} className={`${isEven ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                                {[
                                    planet.name.english,
                                    DMS(planet.degree).toString(),
                                    DMS(planet.rasi.degree).toString(),
                                    planet.rasi.name.english,
                                    planet.rasi.lord,
                                    planet.nakshatra.name.english,
                                    planet.nakshatra.lord,
                                ].map((value, i) => (
                                    <td key={i} className="px-4 py-3 text-sm text-gray-800 border-b border-gray-100">
                                        {i === 0 ? (
                                            <span className="font-semibold text-gray-900">{value}</span>
                                        ) : (
                                            <span className="text-gray-700">{value}</span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
