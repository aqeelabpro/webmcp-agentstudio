import React, { useState } from 'react';
import { WorkflowActionNodeData } from '../../../types/canvas';
import { Zap, Play, CheckCircle2 } from 'lucide-react';

interface Props {
  data: WorkflowActionNodeData;
  onUpdateData: (newData: Partial<WorkflowActionNodeData>) => void;
}

export const WorkflowActionNode: React.FC<Props> = ({ data, onUpdateData }) => {
  const [running, setRunning] = useState(false);

  const handleRunAction = async () => {
    setRunning(true);
    await new Promise((r) => setTimeout(r, 500));

    onUpdateData({
      executionCount: (data.executionCount || 0) + 1,
      lastExecutionStatus: 'success',
    });
    setRunning(false);
  };

  return (
    <div className="flex flex-col h-full text-slate-100 justify-between">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Trigger Rule:</span>
          <span className="font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30 text-[11px]">
            {data.triggerCondition}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs font-mono">
          <div className="flex justify-between text-slate-400">
            <span>Action Type:</span>
            <span className="text-purple-300 uppercase">{data.actionType}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Execution Count:</span>
            <span className="text-emerald-400 font-bold">{data.executionCount || 0} runs</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Last Status:</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> {data.lastExecutionStatus || 'Idle'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Autonomous Dispatcher
        </div>
        <button
          onClick={handleRunAction}
          disabled={running}
          className="flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-purple-500/20 active:scale-95 disabled:opacity-50"
        >
          <Play className="w-3 h-3 fill-current" />
          {running ? 'Firing...' : 'Fire Workflow'}
        </button>
      </div>
    </div>
  );
};
