import React, { useState } from 'react';
import { CanvasNode, CanvasEdge } from '../../types/canvas';
import { useWebMCPRegistry } from '../../lib/webmcp/useWebMCP';
import {
  exportWebMCPManifest,
  exportWorkspaceJSON,
  exportStandaloneHTML,
} from '../../lib/exportHelper';
import {
  Download,
  Copy,
  CheckCircle2,
  X,
  FileCode,
  Globe,
  Layers,
  Sparkles,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

export const ExportModal: React.FC<Props> = ({ isOpen, onClose, nodes, edges }) => {
  const { tools } = useWebMCPRegistry();
  const [tab, setTab] = useState<'manifest' | 'html' | 'json' | 'deploy'>('manifest');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const manifestStr = exportWebMCPManifest(tools);
  const htmlStr = exportStandaloneHTML(nodes, tools);
  const jsonStr = exportWorkspaceJSON(nodes, edges);

  const getActiveContent = () => {
    switch (tab) {
      case 'manifest':
        return manifestStr;
      case 'html':
        return htmlStr;
      case 'json':
        return jsonStr;
      default:
        return '';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename =
      tab === 'manifest'
        ? 'webmcp-manifest.json'
        : tab === 'html'
        ? 'agentstudio-standalone.html'
        : 'workspace-blueprint.json';
    const blob = new Blob([getActiveContent()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl h-[80vh] bg-[#0c111d] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Export & Deployment Center</h2>
              <p className="text-xs text-slate-400">
                Export WebMCP Manifest, Standalone Web App, or Deploy to Cloud
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

        {/* Tab Selection */}
        <div className="px-6 border-b border-slate-800 bg-slate-950/40 flex gap-4">
          <button
            onClick={() => setTab('manifest')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              tab === 'manifest'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            WebMCP Spec Manifest
          </button>
          <button
            onClick={() => setTab('html')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              tab === 'html'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Standalone Single-File HTML
          </button>
          <button
            onClick={() => setTab('json')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              tab === 'json'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Canvas Blueprint JSON
          </button>
          <button
            onClick={() => setTab('deploy')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              tab === 'deploy'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Supporter Deployment Guide
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-hidden flex flex-col min-h-0">
          {tab !== 'deploy' ? (
            <div className="flex-1 flex flex-col min-h-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Ready to be consumed by ChatGPT Sites, Cloudflare Workers, or Chrome 149+.
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 transition-colors"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download File
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs text-cyan-300 overflow-auto select-text">
                <pre>{getActiveContent()}</pre>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-2">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  🌐 1. Deploy on Cloudflare Pages / Workers
                </h3>
                <p className="text-slate-300">
                  Run <code className="text-cyan-300 font-mono">npm run build</code> and deploy the <code className="text-cyan-300 font-mono">dist/</code> folder to Cloudflare Pages or run directly via Cloudflare Browser Run.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  ▲ 2. Deploy on Vercel
                </h3>
                <p className="text-slate-300">
                  Import repository into Vercel dashboard. Zero configuration needed; Vite + React will build automatically.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  🤖 3. Test in Chrome 149+ with WebMCP Flag
                </h3>
                <p className="text-slate-300">
                  Open <code className="text-cyan-300 font-mono">chrome://flags/#enable-webmcp-testing</code> in Chrome 149+, enable the flag, restart Chrome, and visit your deployed URL.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  💬 4. Test in ChatGPT In-App Browser / ChatGPT Sites
                </h3>
                <p className="text-slate-300">
                  Open your hosted link inside ChatGPT's in-app browser to allow ChatGPT agents to directly invoke your registered tools.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
