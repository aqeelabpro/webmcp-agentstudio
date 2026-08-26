import React from 'react';
import { ChartNodeData } from '../../../types/canvas';
import { Activity, TrendingUp } from 'lucide-react';

interface Props {
  data: ChartNodeData;
  onUpdateData: (newData: Partial<ChartNodeData>) => void;
}

export const ChartNode: React.FC<Props> = ({ data }) => {
  const points = data.dataPoints || [];
  const maxValue = Math.max(...points.map((p) => Math.max(p.value, p.secondaryValue || 0)), 100);

  // Generate SVG path for line/area
  const svgWidth = 400;
  const svgHeight = 160;
  const padding = 20;

  const getCoordinates = (index: number, val: number) => {
    const x = padding + (index / Math.max(points.length - 1, 1)) * (svgWidth - 2 * padding);
    const y = svgHeight - padding - (val / maxValue) * (svgHeight - 2 * padding);
    return { x, y };
  };

  const linePath = points
    .map((p, i) => {
      const { x, y } = getCoordinates(i, p.value);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const areaPath = `${linePath} L ${svgWidth - padding} ${svgHeight - padding} L ${padding} ${svgHeight - padding} Z`;

  return (
    <div className="flex flex-col h-full text-slate-100 justify-between">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
        <span className="flex items-center gap-1.5 font-medium text-cyan-400">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          {data.chartType.toUpperCase()} Visualizer
        </span>
        {data.isLiveStreaming && (
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            LIVE EDGE FEED
          </span>
        )}
      </div>

      {/* SVG Chart */}
      <div className="relative w-full h-[180px] bg-slate-950/60 rounded-xl border border-slate-800/80 p-2 overflow-hidden flex items-center justify-center">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id={`grad-${data.themeColor || 'cyan'}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={data.themeColor || '#38bdf8'} stopOpacity="0.4" />
              <stop offset="100%" stopColor={data.themeColor || '#38bdf8'} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={svgWidth - padding} y2={padding} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1={padding} y1={svgHeight / 2} x2={svgWidth - padding} y2={svgHeight / 2} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="rgba(255,255,255,0.12)" />

          {/* Area fill */}
          {points.length > 1 && (
            <path d={areaPath} fill={`url(#grad-${data.themeColor || 'cyan'})`} />
          )}

          {/* Line stroke */}
          {points.length > 1 && (
            <path
              d={linePath}
              fill="none"
              stroke={data.themeColor || '#38bdf8'}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}

          {/* Data point dots */}
          {points.map((p, i) => {
            const { x, y } = getCoordinates(i, p.value);
            return (
              <g key={i} className="group cursor-pointer">
                <circle cx={x} cy={y} r="4" fill="#0f172a" stroke={data.themeColor || '#38bdf8'} strokeWidth="2" />
                <text
                  x={x}
                  y={y - 8}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="9"
                  className="font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {p.value.toLocaleString()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Axis Labels & Stats footer */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-1 font-mono">
          <TrendingUp className="w-3 h-3 text-emerald-400" />
          <span>Peak: <strong className="text-white font-bold">{maxValue.toLocaleString()}</strong></span>
        </div>
        <div className="text-slate-500 font-mono text-[10px]">
          {data.xAxisLabel || 'Timestamp'} • {points.length} Data Points
        </div>
      </div>
    </div>
  );
};
