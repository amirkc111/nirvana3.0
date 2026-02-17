import type { Dasha } from "src/services/calcVimsottariDasa";

interface Props {
    dasa: Dasha;
}

export function DasaTable({ dasa }: Props) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                            Dasa Lord
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                            Start Date
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                            End Date
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="bg-white hover:bg-blue-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-800 border-b border-gray-100">
                            <span className="font-semibold text-gray-900">{dasa.Lord}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">
                            {dasa.StartDate.toString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">
                            {dasa.EndDate.toString()}
                        </td>
                    </tr>

                    {dasa.Phal
                        ? Object.entries(dasa.Phal).map(([book, result], index) => (
                              <tr key={book} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                                  <td className="px-4 py-3 text-sm text-gray-800 border-b border-gray-100">
                                      <span className="font-medium text-gray-900">{book}</span>
                                  </td>
                                  <td colSpan={2} className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">
                                      {result?.hindi || "-"}
                                  </td>
                              </tr>
                          ))
                        : null}
                </tbody>
            </table>
        </div>
    );
}
