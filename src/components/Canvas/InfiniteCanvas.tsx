import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CanvasNode as ICanvasNode, CanvasEdge, CanvasNodeData, NodeType } from '../../types/canvas';
import { CanvasNode } from './CanvasNode';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Plus,
} from 'lucide-react';

interface Props {
  nodes: ICanvasNode[];
  edges: CanvasEdge[];
  onUpdateNodes: (nodes: ICanvasNode[]) => void;
  onUpdateEdges: (edges: CanvasEdge[]) => void;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onAddNode: (type: NodeType) => void;
}

export const InfiniteCanvas: React.FC<Props> = ({
  nodes,
  edges,
  onUpdateNodes,
  onUpdateEdges,
  selectedNodeId,
  onSelectNode,
  onAddNode,
}) => {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Center canvas on first load
  useEffect(() => {
    setPan({ x: 40, y: 30 });
  }, []);

  // Zoom controls
  const handleZoom = useCallback((delta: number) => {
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.4), 2.0));
  }, []);

  const handleResetView = () => {
    setPan({ x: 40, y: 30 });
    setZoom(1);
  };

  // Wheel zoom / pan
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 0.08 : -0.08;
      handleZoom(zoomFactor);
    } else {
      setPan((prev) => ({
        x: prev.x - e.deltaX * 0.8,
        y: prev.y - e.deltaY * 0.8,
      }));
    }
  };

  // Pan Canvas
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      onSelectNode(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    } else if (draggingNodeId) {
      const updatedNodes = nodes.map((node) => {
        if (node.id === draggingNodeId) {
          return {
            ...node,
            position: {
              x: Math.round((e.clientX - pan.x) / zoom - dragOffset.x),
              y: Math.round((e.clientY - pan.y) / zoom - dragOffset.y),
            },
          };
        }
        return node;
      });
      onUpdateNodes(updatedNodes);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  const handleStartDragNode = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetNode = nodes.find((n) => n.id === nodeId);
    if (!targetNode) return;

    onSelectNode(nodeId);
    setDraggingNodeId(nodeId);
    setDragOffset({
      x: (e.clientX - pan.x) / zoom - targetNode.position.x,
      y: (e.clientY - pan.y) / zoom - targetNode.position.y,
    });
  };

  const handleDeleteNode = (nodeId: string) => {
    onUpdateNodes(nodes.filter((n) => n.id !== nodeId));
    onUpdateEdges(edges.filter((e) => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId));
    if (selectedNodeId === nodeId) onSelectNode(null);
  };

  const handleDuplicateNode = (nodeId: string) => {
    const target = nodes.find((n) => n.id === nodeId);
    if (!target) return;
    const newNode: ICanvasNode = {
      ...target,
      id: `node-${Date.now()}`,
      position: { x: target.position.x + 40, y: target.position.y + 40 },
      data: { ...target.data, title: `${target.data.title} (Copy)` },
    };
    onUpdateNodes([...nodes, newNode]);
  };

  const handleUpdateNodeData = (nodeId: string, newData: Partial<CanvasNodeData>) => {
    onUpdateNodes(
      nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: { ...node.data, ...newData, lastModifiedAt: Date.now() },
            }
          : node
      )
    );
  };

  // Helper to compute bezier curve between nodes
  const getEdgeCoordinates = (edge: CanvasEdge) => {
    const srcNode = nodes.find((n) => n.id === edge.sourceNodeId);
    const tgtNode = nodes.find((n) => n.id === edge.targetNodeId);
    if (!srcNode || !tgtNode) return null;

    const srcWidth = srcNode.dimensions?.width || 480;
    const srcHeight = srcNode.dimensions?.height || 360;
    const tgtHeight = tgtNode.dimensions?.height || 360;

    const x1 = srcNode.position.x + srcWidth;
    const y1 = srcNode.position.y + srcHeight / 2;
    const x2 = tgtNode.position.x;
    const y2 = tgtNode.position.y + tgtHeight / 2;

    const dx = Math.max(Math.abs(x2 - x1) * 0.5, 60);
    const path = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    return { path, midX, midY };
  };

  return (
    <div
      ref={canvasRef}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      className="relative flex-1 w-full h-full overflow-hidden bg-[#080c14] canvas-grid cursor-grab active:cursor-grabbing"
    >
      {/* Zoom / Viewport Controls Floating Dock */}
      <div className="absolute bottom-6 left-6 z-50 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-2xl backdrop-blur-xl">
        <button
          onClick={() => handleZoom(0.1)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono text-cyan-400 px-2 min-w-[50px] text-center font-bold">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => handleZoom(-0.1)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-slate-800 mx-1" />
        <button
          onClick={handleResetView}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Reset View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Add Node Dock */}
      <div className="absolute top-6 left-6 z-50 flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-2xl backdrop-blur-xl">
        <span className="text-xs font-semibold text-slate-400 px-2 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 text-cyan-400" />
          Add Node:
        </span>
        <button
          onClick={() => onAddNode('commerce_cart')}
          className="px-2.5 py-1 text-xs bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition-all font-medium"
        >
          + Storefront
        </button>
        <button
          onClick={() => onAddNode('chart')}
          className="px-2.5 py-1 text-xs bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl transition-all font-medium"
        >
          + Chart
        </button>
        <button
          onClick={() => onAddNode('data_table')}
          className="px-2.5 py-1 text-xs bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl transition-all font-medium"
        >
          + Data Table
        </button>
        <button
          onClick={() => onAddNode('ui_component')}
          className="px-2.5 py-1 text-xs bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl transition-all font-medium"
        >
          + UI Preview
        </button>
        <button
          onClick={() => onAddNode('api_connector')}
          className="px-2.5 py-1 text-xs bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-all font-medium"
        >
          + API Bridge
        </button>
      </div>

      {/* Transform Container */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
        className="absolute inset-0 w-[4000px] h-[4000px] pointer-events-auto"
      >
        {/* SVG Edges Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
          <defs>
            <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {edges.map((edge) => {
            const edgeCoords = getEdgeCoordinates(edge);
            if (!edgeCoords) return null;

            return (
              <g key={edge.id} className="group">
                {/* Glow Line */}
                <path
                  d={edgeCoords.path}
                  fill="none"
                  stroke="url(#edge-gradient)"
                  strokeWidth="4"
                  opacity="0.3"
                  filter="url(#glow)"
                />
                {/* Main Path */}
                <path
                  d={edgeCoords.path}
                  fill="none"
                  stroke="url(#edge-gradient)"
                  strokeWidth="2.5"
                  strokeDasharray={edge.animated ? '6 4' : undefined}
                  className={edge.animated ? 'animate-[dash_1.5s_linear_infinite]' : ''}
                />
                {/* Midpoint Label Badge */}
                {edge.label && (
                  <g transform={`translate(${edgeCoords.midX}, ${edgeCoords.midY})`}>
                    <rect
                      x="-55"
                      y="-12"
                      width="110"
                      height="24"
                      rx="12"
                      fill="#0f172a"
                      stroke="#1e293b"
                      strokeWidth="1.5"
                    />
                    <text
                      textAnchor="middle"
                      dy="4"
                      fill="#38bdf8"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {edge.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Nodes Layer */}
        <div className="absolute inset-0 z-30">
          {nodes.map((node) => (
            <CanvasNode
              key={node.id}
              node={node}
              selected={selectedNodeId === node.id}
              onSelect={onSelectNode}
              onDelete={handleDeleteNode}
              onDuplicate={handleDuplicateNode}
              onUpdateData={handleUpdateNodeData}
              onStartDrag={handleStartDragNode}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
