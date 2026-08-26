import React, { useState } from 'react';
import { UiComponentNodeData } from '../../../types/canvas';
import { Code, Eye, Sparkles, Check } from 'lucide-react';

interface Props {
  data: UiComponentNodeData;
  onUpdateData: (newData: Partial<UiComponentNodeData>) => void;
}

export const UiComponentNode: React.FC<Props> = ({ data, onUpdateData }) => {
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);
  const [counterValue, setCounterValue] = useState(0);
  const [emailInput, setEmailInput] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(data.jsxCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full text-slate-100 min-h-0">
      {/* Top Header Mode Toggle */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
              viewMode === 'preview'
                ? 'bg-cyan-500 text-slate-950 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Live Preview
          </button>
          <button
            onClick={() => setViewMode('code')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all ${
              viewMode === 'code'
                ? 'bg-cyan-500 text-slate-950 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            JSX Code
          </button>
        </div>

        {viewMode === 'code' && (
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-300 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
            {copied ? 'Copied' : 'Copy JSX'}
          </button>
        )}
      </div>

      {/* Main View Area */}
      <div className="flex-1 overflow-auto rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 min-h-0">
        {viewMode === 'preview' ? (
          <div className="h-full flex flex-col justify-center">
            {data.componentType === 'pricing' ? (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-500/40 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                    ⚡ WebMCP Pro Suite
                  </span>
                  <span className="text-xl font-extrabold text-white">
                    $49<span className="text-xs font-normal text-slate-400">/mo</span>
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">Agent-Native Infrastructure</h3>
                <p className="text-xs text-slate-300 mb-4">
                  Autonomous WebMCP tools, real-time bi-directional sync, infinite scalability.
                </p>
                <div className="space-y-1.5 mb-4 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span> Full WebMCP Specification Support
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span> Instant Chrome 149+ & ChatGPT Integration
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span> Multi-Agent Visual Canvas Streaming
                  </div>
                </div>
                <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-semibold text-white text-xs shadow-lg hover:shadow-cyan-500/25 active:scale-[0.98] transition-all">
                  Deploy Application
                </button>
              </div>
            ) : data.componentType === 'form' || data.componentType === 'custom_jsx' ? (
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Newsletter & Early Access
                </h3>
                <p className="text-xs text-slate-400">
                  Subscribe to receive real-time WebMCP releases and developer tutorials.
                </p>
                {emailSubmitted ? (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Thank you! You're on the early access list.
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="developer@openai.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      onClick={() => setEmailSubmitted(true)}
                      className="px-4 py-1.5 bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-cyan-400 transition-colors"
                    >
                      Join
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Counter Demo */
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl text-center space-y-4">
                <h3 className="text-sm font-bold text-white">Interactive State Counter</h3>
                <div className="text-4xl font-extrabold text-cyan-400 font-mono">{counterValue}</div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCounterValue((v) => v - 1)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold"
                  >
                    - Decrement
                  </button>
                  <button
                    onClick={() => setCounterValue(0)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-400"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setCounterValue((v) => v + 1)}
                    className="px-3 py-1.5 bg-cyan-500 text-slate-950 hover:bg-cyan-400 rounded-lg text-xs font-bold"
                  >
                    + Increment
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <textarea
            value={data.jsxCode}
            onChange={(e) => onUpdateData({ jsxCode: e.target.value })}
            className="w-full h-full bg-slate-950 font-mono text-xs text-cyan-300 p-2 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 resize-none select-text"
            spellCheck={false}
          />
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-1 border-t border-slate-800/80">
        <span>Framework: <strong>React 19 + Tailwind CSS</strong></span>
        <span className="text-cyan-400 font-mono">generate_react_component hooked</span>
      </div>
    </div>
  );
};
