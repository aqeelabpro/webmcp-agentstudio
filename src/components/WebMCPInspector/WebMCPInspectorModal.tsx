import React, { useState } from 'react';
import { useWebMCPRegistry } from '../../lib/webmcp/useWebMCP';
import { WebMCPToolDefinition } from '../../types/webmcp';
import {
  Wrench,
  Activity,
  CheckCircle2,
  Play,
  Copy,
  Trash2,
  X,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const WebMCPInspectorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { tools, logs, executeTool, clearLogs, nativeSupport } = useWebMCPRegistry();
  const [activeTab, setActiveTab] = useState<'tools' | 'logs' | 'tester'>('tools');
  const [selectedTool, setSelectedTool] = useState<WebMCPToolDefinition | null>(tools[0] || null);
  const [testInputJson, setTestInputJson] = useState('{}');
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSelectToolForTest = (tool: WebMCPToolDefinition) => {
    setSelectedTool(tool);
    // Generate default template from inputSchema
    const defaultParams: Record<string, unknown> = {};
    if (tool.inputSchema?.properties) {
      Object.entries(tool.inputSchema.properties).forEach(([key, prop]) => {
        defaultParams[key] =
          prop.default !== undefined
            ? prop.default
            : prop.type === 'string'
            ? 'sample_query'
            : prop.type === 'number'
            ? 1
            : prop.type === 'boolean'
            ? true
            : {};
      });
    }
    setTestInputJson(JSON.stringify(defaultParams, null, 2));
    setTestOutput(null);
  };

  const handleRunManualTest = async () => {
    if (!selectedTool) return;
    setIsExecuting(true);
    try {
      const parsedInput = JSON.parse(testInputJson);
      const result = await executeTool(selectedTool.name, parsedInput);
      setTestOutput(JSON.stringify(result, null, 2));
    } catch (err: unknown) {
      setTestOutput(
        JSON.stringify({ error: err instanceof Error ? err.message : String(err) }, null, 2)
      );
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopySchema = (tool: WebMCPToolDefinition) => {
    navigator.clipboard.writeText(JSON.stringify(tool, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[85vh] bg-[#0c111d] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">WebMCP Inspector & DevTools</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  v1.0.0 Specification
                </span>
                {nativeSupport ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Chrome 149+ Native Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/30">
                    WebMCP Polyfill Bound
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Inspect, invoke, and debug tools registered on <code className="text-cyan-300 font-mono">document.modelContext</code>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-800 bg-slate-950/40 flex gap-4">
          <button
            onClick={() => setActiveTab('tools')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'tools'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Registered Tools ({tools.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'logs'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Invocation Logs ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('tester')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'tester'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            Manual Tool Tester
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden p-6">
          {activeTab === 'tools' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-0">
              {/* Tool List Sidebar */}
              <div className="border border-slate-800 rounded-xl bg-slate-950/50 p-3 overflow-y-auto space-y-2 min-h-0">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Active WebMCP Tools
                </div>
                {tools.map((t) => (
                  <div
                    key={t.name}
                    onClick={() => setSelectedTool(t)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedTool?.name === t.name
                        ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-200 shadow-md'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-xs">{t.name}</span>
                      {t.requiresConfirmation && (
                        <span title="Requires Human Confirmation">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Tool Schema & Metadata Viewer */}
              <div className="md:col-span-2 border border-slate-800 rounded-xl bg-slate-950/70 p-4 flex flex-col min-h-0 overflow-y-auto">
                {selectedTool ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold font-mono text-cyan-400">
                            {selectedTool.name}
                          </h3>
                          {selectedTool.requiresConfirmation && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                              Human Confirmation Required
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 mt-1">{selectedTool.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopySchema(selectedTool)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 transition-colors"
                        >
                          {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          {copied ? 'Copied' : 'Copy Tool Spec'}
                        </button>
                        <button
                          onClick={() => {
                            handleSelectToolForTest(selectedTool);
                            setActiveTab('tester');
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Test Tool
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        Input Schema (JSON Schema draft-07)
                      </h4>
                      <pre className="p-4 rounded-xl bg-[#070b13] border border-slate-800/90 font-mono text-xs text-cyan-300 overflow-x-auto select-text leading-relaxed">
                        {JSON.stringify(selectedTool.inputSchema, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 text-center py-12">Select a tool to inspect schema.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="flex flex-col h-full min-h-0">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400">
                  Recorded WebMCP tool calls executed by agent, ChatGPT, or developer.
                </span>
                <button
                  onClick={clearLogs}
                  className="flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-lg text-xs transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Logs
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 min-h-0 border border-slate-800 rounded-xl bg-slate-950/40 p-3">
                {logs.length === 0 ? (
                  <div className="text-slate-500 text-center py-16 text-xs">
                    No tool invocations recorded yet. Run a prompt in Co-Pilot or trigger a tool.
                  </div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              log.status === 'success'
                                ? 'bg-emerald-400'
                                : log.status === 'rejected'
                                ? 'bg-amber-400'
                                : 'bg-rose-400'
                            }`}
                          />
                          <span className="font-bold text-cyan-300">{log.toolName}</span>
                          <span className="text-[10px] text-slate-500">{log.id}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                          {log.durationMs && <span>{log.durationMs}ms</span>}
                          <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80 overflow-x-auto">
                          <span className="text-slate-500 font-sans text-[10px] block mb-1">Input:</span>
                          <pre className="text-slate-300">{JSON.stringify(log.input, null, 2)}</pre>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80 overflow-x-auto">
                          <span className="text-slate-500 font-sans text-[10px] block mb-1">Output / Error:</span>
                          <pre className={log.error ? 'text-rose-400' : 'text-emerald-300'}>
                            {log.error || JSON.stringify(log.output, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'tester' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-0">
              <div className="flex flex-col min-h-0 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Select Tool:</label>
                  <select
                    value={selectedTool?.name || ''}
                    onChange={(e) => {
                      const t = tools.find((tool) => tool.name === e.target.value);
                      if (t) handleSelectToolForTest(t);
                    }}
                    className="bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-cyan-500"
                  >
                    {tools.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 flex flex-col min-h-0">
                  <label className="text-xs font-semibold text-slate-400 mb-1">Input Payload (JSON):</label>
                  <textarea
                    value={testInputJson}
                    onChange={(e) => setTestInputJson(e.target.value)}
                    className="flex-1 w-full bg-slate-950 font-mono text-xs text-cyan-300 p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 resize-none select-text"
                    spellCheck={false}
                  />
                </div>

                <button
                  onClick={handleRunManualTest}
                  disabled={isExecuting}
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold text-white text-xs rounded-xl shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                >
                  <Play className={`w-3.5 h-3.5 fill-current ${isExecuting ? 'animate-spin' : ''}`} />
                  {isExecuting ? 'Executing WebMCP Tool...' : 'Execute Tool on document.modelContext'}
                </button>
              </div>

              <div className="flex flex-col min-h-0">
                <label className="text-xs font-semibold text-slate-400 mb-1">Execution Output:</label>
                <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-3 font-mono text-xs overflow-auto select-text">
                  {testOutput ? (
                    <pre className="text-emerald-300">{testOutput}</pre>
                  ) : (
                    <div className="text-slate-500 text-center py-20">
                      Output will appear here after execution.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
