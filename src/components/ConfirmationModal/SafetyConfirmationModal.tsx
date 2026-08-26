import React from 'react';
import { ShieldAlert, Check, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  toolName: string;
  toolInput: Record<string, unknown>;
  onConfirm: () => void;
  onReject: () => void;
}

export const SafetyConfirmationModal: React.FC<Props> = ({
  isOpen,
  toolName,
  toolInput,
  onConfirm,
  onReject,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#0f1422] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-100 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Human-in-the-Loop Confirmation</h3>
            <p className="text-xs text-amber-300/80">WebMCP Trust Boundary Guard</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          An agent is attempting to execute sensitive WebMCP tool <code className="text-amber-300 font-mono font-bold">{toolName}</code>. Do you approve this action?
        </p>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs overflow-auto max-h-36">
          <div className="text-[10px] text-slate-500 mb-1">Payload:</div>
          <pre className="text-cyan-300">{JSON.stringify(toolInput, null, 2)}</pre>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onReject}
            className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <X className="w-4 h-4 text-rose-400" />
            Reject Action
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-amber-500/20"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            Approve Execution
          </button>
        </div>
      </div>
    </div>
  );
};
