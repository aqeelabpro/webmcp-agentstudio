import React, { useState } from 'react';
import { ApiConnectorNodeData } from '../../../types/canvas';
import { Globe, Play, CheckCircle2 } from 'lucide-react';

interface Props {
  data: ApiConnectorNodeData;
  onUpdateData: (newData: Partial<ApiConnectorNodeData>) => void;
}

export const ApiNode: React.FC<Props> = ({ data, onUpdateData }) => {
  const [testing, setTesting] = useState(false);

  const handleTestEndpoint = async () => {
    setTesting(true);
    await new Promise((r) => setTimeout(r, 600));

    onUpdateData({
      lastResponse: {
        status: 200,
        timestamp: Date.now(),
        data: {
          status: 'success',
          endpoint: data.endpointUrl,
          latencyMs: 16.4,
          modelContextSync: true,
          activeWebMCPTools: ['search_products', 'modify_cart', 'query_edge_telemetry'],
        },
      },
    });
    setTesting(false);
  };

  return (
    <div className="flex flex-col h-full text-slate-100 justify-between">
      {/* Endpoint URL bar */}
      <div className="space-y-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold rounded border border-emerald-500/30">
            {data.method}
          </span>
          <div className="flex-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 truncate">
            {data.endpointUrl}
          </div>
          <button
            onClick={handleTestEndpoint}
            disabled={testing}
            className="flex items-center gap-1 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
          >
            <Play className={`w-3 h-3 fill-current ${testing ? 'animate-spin' : ''}`} />
            {testing ? 'Calling...' : 'Send'}
          </button>
        </div>
      </div>

      {/* Response Box */}
      <div className="flex-1 rounded-xl bg-slate-950/80 border border-slate-800 p-2.5 overflow-auto font-mono text-[11px] min-h-[100px]">
        {data.lastResponse ? (
          <div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1.5 mb-1.5 border-b border-slate-800/80">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3 h-3" />
                Status: {data.lastResponse.status} OK
              </span>
              <span>{new Date(data.lastResponse.timestamp).toLocaleTimeString()}</span>
            </div>
            <pre className="text-cyan-300 overflow-x-auto select-text">
              {JSON.stringify(data.lastResponse.data, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="text-slate-500 text-center py-6">
            Click 'Send' or trigger via WebMCP agent to fetch data.
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-1 border-t border-slate-800/80">
        <span className="flex items-center gap-1">
          <Globe className="w-3 h-3 text-cyan-400" />
          Cloudflare / Worker Bridge
        </span>
        <span className="font-mono text-emerald-400">Mock Mode: Active</span>
      </div>
    </div>
  );
};
