import React from 'react';
import { CanvasNode as ICanvasNode, CanvasNodeData } from '../../types/canvas';
import { CommerceNode } from './nodes/CommerceNode';
import { ChartNode } from './nodes/ChartNode';
import { DataTableNode } from './nodes/DataTableNode';
import { UiComponentNode } from './nodes/UiComponentNode';
import { ApiNode } from './nodes/ApiNode';
import { WorkflowActionNode } from './nodes/WorkflowActionNode';
import { MarkdownDocNode } from './nodes/MarkdownDocNode';
import {
  Trash2,
  Copy,
  Sparkles,
  GripHorizontal,
} from 'lucide-react';

interface Props {
  node: ICanvasNode;
  selected?: boolean;
  onSelect: (nodeId: string, e: React.MouseEvent) => void;
  onDelete: (nodeId: string) => void;
  onDuplicate: (nodeId: string) => void;
  onUpdateData: (nodeId: string, newData: Partial<CanvasNodeData>) => void;
  onStartDrag: (nodeId: string, e: React.MouseEvent) => void;
}

export const CanvasNode: React.FC<Props> = ({
  node,
  selected,
  onSelect,
  onDelete,
  onDuplicate,
  onUpdateData,
  onStartDrag,
}) => {
  const width = node.dimensions?.width || 480;
  const height = node.dimensions?.height || 360;

  const renderContent = () => {
    switch (node.type) {
      case 'commerce_cart':
        return (
          <CommerceNode
            data={node.data as any}
            onUpdateData={(newData) => onUpdateData(node.id, newData)}
          />
        );
      case 'chart':
        return (
          <ChartNode
            data={node.data as any}
            onUpdateData={(newData) => onUpdateData(node.id, newData)}
          />
        );
      case 'data_table':
        return (
          <DataTableNode
            data={node.data as any}
            onUpdateData={(newData) => onUpdateData(node.id, newData)}
          />
        );
      case 'ui_component':
        return (
          <UiComponentNode
            data={node.data as any}
            onUpdateData={(newData) => onUpdateData(node.id, newData)}
          />
        );
      case 'api_connector':
        return (
          <ApiNode
            data={node.data as any}
            onUpdateData={(newData) => onUpdateData(node.id, newData)}
          />
        );
      case 'workflow_action':
        return (
          <WorkflowActionNode
            data={node.data as any}
            onUpdateData={(newData) => onUpdateData(node.id, newData)}
          />
        );
      case 'markdown_doc':
        return (
          <MarkdownDocNode
            data={node.data as any}
            onUpdateData={(newData) => onUpdateData(node.id, newData)}
          />
        );
      default:
        return <div className="text-slate-400 p-4">Unknown Node Type</div>;
    }
  };

  return (
    <div
      style={{
        transform: `translate(${node.position.x}px, ${node.position.y}px)`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: selected ? 40 : node.zIndex || 10,
      }}
      onClick={(e) => onSelect(node.id, e)}
      className={`absolute select-none transition-shadow rounded-2xl flex flex-col backdrop-blur-xl border ${
        selected
          ? 'border-cyan-400 ring-2 ring-cyan-500/30 shadow-2xl shadow-cyan-500/20'
          : 'border-slate-800/90 hover:border-slate-700 shadow-xl'
      } ${
        node.isExecuting
          ? 'border-cyan-400 agent-active-glow'
          : 'bg-[#0f1523]/95'
      }`}
    >
      {/* Top Accent Color Bar */}
      <div
        className="h-1.5 w-full rounded-t-2xl"
        style={{ backgroundColor: node.data.themeColor || '#38bdf8' }}
      />

      {/* Header Bar */}
      <div
        onMouseDown={(e) => onStartDrag(node.id, e)}
        className="px-4 py-2.5 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 cursor-grab active:cursor-grabbing select-none rounded-t-lg"
      >
        <div className="flex items-center gap-2 min-w-0">
          <GripHorizontal className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-100 truncate">
                {node.data.title}
              </span>
              {node.data.isAgentModified && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-cyan-400" /> AI Synced
                </span>
              )}
            </div>
            {node.data.description && (
              <span className="text-[11px] text-slate-400 truncate">
                {node.data.description}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(node.id);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Duplicate Node"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete Node"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Node Body Content */}
      <div className="flex-1 p-3.5 min-h-0 overflow-hidden">
        {renderContent()}
      </div>

      {/* Left Input Port */}
      <div
        className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center shadow-md hover:scale-125 transition-transform cursor-crosshair group"
        title="Input Connection"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
      </div>

      {/* Right Output Port */}
      <div
        className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-900 border-2 border-emerald-400 flex items-center justify-center shadow-md hover:scale-125 transition-transform cursor-crosshair group"
        title="Output Connection"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      </div>
    </div>
  );
};
