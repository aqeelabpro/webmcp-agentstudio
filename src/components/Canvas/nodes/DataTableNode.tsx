import React, { useState } from 'react';
import { DataTableNodeData } from '../../../types/canvas';
import { Table, Search, ArrowUpDown } from 'lucide-react';

interface Props {
  data: DataTableNodeData;
  onUpdateData: (newData: Partial<DataTableNodeData>) => void;
}

export const DataTableNode: React.FC<Props> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filteredRows = (data.rows || []).filter((row) => {
    if (!searchTerm) return true;
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const sortedRows = [...filteredRows].sort((a, b) => {
    if (!sortKey) return 0;
    const valA = a[sortKey];
    const valB = b[sortKey];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortDir === 'asc' ? valA - valB : valB - valA;
    }
    return sortDir === 'asc'
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const renderBadge = (val: string) => {
    const s = String(val).toLowerCase();
    let colorClass = 'bg-slate-800 text-slate-300 border-slate-700';
    if (s.includes('200') || s.includes('ok') || s.includes('positive') || s.includes('resolved')) {
      colorClass = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    } else if (s.includes('50') || s.includes('critical') || s.includes('urgent') || s.includes('failed')) {
      colorClass = 'bg-rose-500/10 text-rose-300 border-rose-500/30';
    } else if (s.includes('high') || s.includes('review') || s.includes('triage') || s.includes('frustrated')) {
      colorClass = 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    }

    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${colorClass}`}>
        {val}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full text-slate-100 min-h-0">
      {/* Search & Filter Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search rows or query via WebMCP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
          {sortedRows.length} of {data.rows.length} rows
        </span>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto border border-slate-800/80 rounded-xl bg-slate-950/40">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-900/90 sticky top-0 border-b border-slate-800 z-10">
            <tr>
              {data.columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-3 py-2 text-[11px] font-semibold text-slate-300 cursor-pointer hover:text-cyan-300 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>{col.label}</span>
                    <ArrowUpDown className="w-2.5 h-2.5 text-slate-500" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={data.columns.length} className="text-center py-6 text-slate-500 text-xs">
                  No matching records found.
                </td>
              </tr>
            ) : (
              sortedRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/60 transition-colors group">
                  {data.columns.map((col) => (
                    <td key={col.key} className="px-3 py-2 text-slate-300 font-mono text-[11px]">
                      {col.type === 'badge' ? (
                        renderBadge(String(row[col.key] || ''))
                      ) : col.type === 'currency' ? (
                        <span className="text-emerald-400 font-bold">${Number(row[col.key] || 0).toFixed(2)}</span>
                      ) : (
                        String(row[col.key] ?? '-')
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-1.5 border-t border-slate-800/80">
        <span className="flex items-center gap-1">
          <Table className="w-3 h-3 text-cyan-400" />
          WebMCP Queryable Table
        </span>
        <span className="font-mono text-cyan-400/80">document.modelContext bound</span>
      </div>
    </div>
  );
};
