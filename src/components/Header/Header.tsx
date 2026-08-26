import React from 'react';
import { WorkspacePreset } from '../../types/canvas';
import {
  Sparkles,
  Wrench,
  Download,
  Bot,
  RotateCcw,
  Layers,
} from 'lucide-react';

interface Props {
  presets: WorkspacePreset[];
  activePresetId: string;
  onSelectPreset: (presetId: string) => void;
  onOpenInspector: () => void;
  onOpenExport: () => void;
  onResetCanvas: () => void;
  isCopilotOpen: boolean;
  onToggleCopilot: () => void;
  activeToolsCount: number;
}

export const Header: React.FC<Props> = ({
  presets,
  activePresetId,
  onSelectPreset,
  onOpenInspector,
  onOpenExport,
  onResetCanvas,
  isCopilotOpen,
  onToggleCopilot,
  activeToolsCount,
}) => {
  return (
    <header className="h-14 bg-[#080c15] border-b border-slate-800/90 px-4 flex items-center justify-between select-none z-40 relative">
      {/* Brand & Project Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#080c15] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white">
                AgentStudio
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded font-mono">
                WebMCP Challenge
              </span>
            </div>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

        {/* Preset / Template Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl px-2 py-1">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] text-slate-400 hidden md:inline">Workspace:</span>
          <select
            value={activePresetId}
            onChange={(e) => onSelectPreset(e.target.value)}
            className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer pr-1"
          >
            {presets.map((preset) => (
              <option key={preset.id} value={preset.id} className="bg-slate-900 text-white">
                {preset.title} ({preset.badge})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* WebMCP Status Badge */}
        <button
          onClick={onOpenInspector}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition-all group"
          title="Open WebMCP DevTools & Schema Inspector"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-cyan-300 font-bold">{activeToolsCount}</span>
          <span className="text-slate-400 group-hover:text-white transition-colors">Tools Bound</span>
          <Wrench className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors ml-0.5" />
        </button>

        {/* Export Modal Trigger */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Reset Canvas */}
        <button
          onClick={onResetCanvas}
          className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-300 transition-colors"
          title="Reset Workspace"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Toggle Co-Pilot Sidebar */}
        <button
          onClick={onToggleCopilot}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
            isCopilotOpen
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-cyan-500/20 ring-2 ring-cyan-400/40'
              : 'bg-slate-900 border border-slate-800 text-cyan-300 hover:bg-slate-800'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Co-Pilot</span>
        </button>
      </div>
    </header>
  );
};
