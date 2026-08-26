import React, { useState } from 'react';
import { MarkdownDocNodeData } from '../../../types/canvas';
import { FileText, Edit2, Check, Tag } from 'lucide-react';

interface Props {
  data: MarkdownDocNodeData;
  onUpdateData: (newData: Partial<MarkdownDocNodeData>) => void;
}

export const MarkdownDocNode: React.FC<Props> = ({ data, onUpdateData }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex flex-col h-full text-slate-100 min-h-0 justify-between">
      {/* Top Header Actions */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <FileText className="w-3.5 h-3.5 text-pink-400" />
          <span>By <strong>{data.author || 'Agent'}</strong></span>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-1 px-2 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 flex items-center gap-1 transition-colors"
        >
          {isEditing ? <Check className="w-3 h-3 text-emerald-400" /> : <Edit2 className="w-3 h-3 text-cyan-400" />}
          {isEditing ? 'Done' : 'Edit'}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto rounded-xl bg-slate-950/60 border border-slate-800/80 p-3 text-xs leading-relaxed select-text min-h-0">
        {isEditing ? (
          <textarea
            value={data.content}
            onChange={(e) => onUpdateData({ content: e.target.value })}
            className="w-full h-full bg-transparent font-mono text-xs text-slate-200 focus:outline-none resize-none"
            spellCheck={false}
          />
        ) : (
          <div className="space-y-2 whitespace-pre-wrap font-sans text-slate-300">
            {data.content}
          </div>
        )}
      </div>

      {/* Tags Footer */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-1.5 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Tag className="w-3 h-3 text-slate-500" />
          {(data.tags || []).map((tag, i) => (
            <span
              key={i}
              className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
