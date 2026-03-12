interface ProtocolRow {
  id: number;
  full_name: string;
  rank?: string;
  family_count: number;
  amount: number;
  protocol_number: string;
  protocol_date: string;
  note: string;
}

interface ProtocolsTableProps {
  protocols: ProtocolRow[];
}

export function ProtocolsTable({ protocols }: ProtocolsTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                №
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                Rütbə
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                Soyad, ad və atasının adı
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                Ailə üzvlərinin sayı
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                Məbləğ
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                Protokol №
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                Protokol tarixi
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                Qeyd
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {protocols.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-6 text-center text-xs text-gray-500"
                >
                  Məlumat yoxdur
                </td>
              </tr>
            ) : (
              protocols.map((p, index) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-3 py-1.5 text-xs text-gray-900">{index + 1}</td>
                  <td className="px-3 py-1.5 text-xs text-gray-900">{p.rank || '-'}</td>
                  <td className="px-3 py-1.5 text-xs text-gray-900">{p.full_name}</td>
                  <td className="px-3 py-1.5 text-xs text-gray-900 text-center">
                    {p.family_count}
                  </td>
                  <td className="px-3 py-1.5 text-xs text-gray-900">
                    {p.amount.toLocaleString('az-AZ', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-3 py-1.5 text-xs text-gray-900">
                    {p.protocol_number || '-'}
                  </td>
                  <td className="px-3 py-1.5 text-xs text-gray-900">
                    {p.protocol_date
                      ? new Date(p.protocol_date).toLocaleDateString('az-AZ')
                      : '-'}
                  </td>
                  <td className="px-3 py-1.5 text-xs text-gray-900 max-w-xs truncate">
                    {p.note}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

