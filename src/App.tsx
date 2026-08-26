import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { WORKSPACE_PRESETS } from './lib/templates/presets';
import { CanvasNode, CanvasEdge, NodeType } from './types/canvas';
import { InfiniteCanvas } from './components/Canvas/InfiniteCanvas';
import { Header } from './components/Header/Header';
import { AgentChatSidebar } from './components/AgentCopilot/AgentChatSidebar';
import { WebMCPInspectorModal } from './components/WebMCPInspector/WebMCPInspectorModal';
import { ExportModal } from './components/ExportModal/ExportModal';
import { SafetyConfirmationModal } from './components/ConfirmationModal/SafetyConfirmationModal';
import { globalModelContext, initWebMCPPolyfill } from './lib/webmcp/modelContextPolyfill';
import { useWebMCPRegistry } from './lib/webmcp/useWebMCP';

export function App() {
  const [activePresetId, setActivePresetId] = useState<string>(WORKSPACE_PRESETS[0].id);
  const activePreset = WORKSPACE_PRESETS.find((p) => p.id === activePresetId) || WORKSPACE_PRESETS[0];

  const [nodes, setNodes] = useState<CanvasNode[]>(activePreset.nodes);
  const [edges, setEdges] = useState<CanvasEdge[]>(activePreset.edges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Modals & Panels
  const [isCopilotOpen, setIsCopilotOpen] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Safety Confirmation Modal state
  const [safetyModalState, setSafetyModalState] = useState<{
    isOpen: boolean;
    toolName: string;
    toolInput: Record<string, unknown>;
    resolver?: (confirmed: boolean) => void;
  }>({
    isOpen: false,
    toolName: '',
    toolInput: {},
  });

  const { tools } = useWebMCPRegistry();

  // Ref to access current nodes inside tool callbacks without re-registering
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const edgesRef = useRef(edges);
  edgesRef.current = edges;

  // Initialize WebMCP Polyfill and Safety Handler
  useEffect(() => {
    initWebMCPPolyfill();

    globalModelContext.setConfirmationHandler(async (tool, input) => {
      return new Promise<boolean>((resolve) => {
        setSafetyModalState({
          isOpen: true,
          toolName: tool.name,
          toolInput: input,
          resolver: resolve,
        });
      });
    });
  }, []);

  // Register WebMCP Tools dynamically on document.modelContext
  useEffect(() => {
    // Tool 1: get_workspace_state
    const unregState = globalModelContext.registerTool({
      name: 'get_workspace_state',
      description: 'Get current visual canvas state including all nodes, data, and edge connections.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      category: 'canvas',
      execute: async () => {
        return {
          nodeCount: nodesRef.current.length,
          edgeCount: edgesRef.current.length,
          nodes: nodesRef.current.map((n) => ({
            id: n.id,
            type: n.type,
            title: n.data.title,
            position: n.position,
          })),
          activePreset: activePresetId,
        };
      },
    });

    // Tool 2: search_products (Shopify WebMCP standard)
    const unregSearch = globalModelContext.registerTool({
      name: 'search_products',
      description: 'Search product catalog in active store node with keyword query and filters.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Product search keyword (e.g. headphones, keyboard)' },
          maxResults: { type: 'number', description: 'Maximum products to return', default: 5 },
        },
        required: ['query'],
      },
      category: 'commerce',
      execute: async (input: { query: string; maxResults?: number }) => {
        const storeNode = nodesRef.current.find((n) => n.type === 'commerce_cart');
        if (!storeNode) throw new Error('No commerce store node found on canvas.');

        const products = (storeNode.data as any).products || [];
        const q = input.query.toLowerCase();
        const matches = products.filter(
          (p: any) =>
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );

        return {
          query: input.query,
          totalMatches: matches.length,
          products: matches.slice(0, input.maxResults || 5),
        };
      },
    });

    // Tool 3: modify_cart (Shopify WebMCP standard)
    const unregCart = globalModelContext.registerTool({
      name: 'modify_cart',
      description: 'Add or remove products from the active customer shopping cart session.',
      inputSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['add', 'remove', 'clear'], description: 'Cart operation' },
          productId: { type: 'string', description: 'Unique product ID' },
          quantity: { type: 'number', description: 'Quantity to add/remove', default: 1 },
        },
        required: ['action'],
      },
      category: 'commerce',
      execute: async (input: { action: 'add' | 'remove' | 'clear'; productId?: string; quantity?: number }) => {
        const storeNode = nodesRef.current.find((n) => n.type === 'commerce_cart');
        if (!storeNode) throw new Error('No commerce store node found on canvas.');

        const storeData = storeNode.data as any;
        let newCart = [...storeData.cart];

        if (input.action === 'add' && input.productId) {
          const product = storeData.products.find((p: any) => p.id === input.productId) || storeData.products[0];
          const existingIdx = newCart.findIndex((item: any) => item.product.id === product.id);
          const qty = input.quantity || 1;

          if (existingIdx >= 0) {
            newCart[existingIdx] = { ...newCart[existingIdx], quantity: newCart[existingIdx].quantity + qty };
          } else {
            newCart.push({ product, quantity: qty });
          }
        } else if (input.action === 'remove' && input.productId) {
          newCart = newCart.filter((item: any) => item.product.id !== input.productId);
        } else if (input.action === 'clear') {
          newCart = [];
        }

        const subtotal = newCart.reduce((sum: number, item: any) => sum + item.product.price * item.quantity, 0);
        const discountMultiplier = storeData.discountTotal > 0 ? 0.85 : 1.0;
        const total = subtotal * discountMultiplier;

        const updatedData = {
          ...storeData,
          cart: newCart,
          subtotal: Math.round(subtotal * 100) / 100,
          total: Math.round(total * 100) / 100,
          isAgentModified: true,
        };

        setNodes((prev) =>
          prev.map((n) => (n.id === storeNode.id ? { ...n, data: updatedData } : n))
        );

        confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });

        return {
          status: 'success',
          action: input.action,
          itemCount: newCart.length,
          subtotal: updatedData.subtotal,
          total: updatedData.total,
        };
      },
    });

    // Tool 4: apply_discount
    const unregDiscount = globalModelContext.registerTool({
      name: 'apply_discount',
      description: 'Apply promotional coupon or agent-negotiated discount percentage to cart.',
      inputSchema: {
        type: 'object',
        properties: {
          promoCode: { type: 'string', description: 'Coupon code or agent negotiation token' },
          discountPercent: { type: 'number', description: 'Discount percentage (1-50)', default: 15 },
        },
        required: ['promoCode'],
      },
      category: 'commerce',
      execute: async (input: { promoCode: string; discountPercent?: number }) => {
        const storeNode = nodesRef.current.find((n) => n.type === 'commerce_cart');
        if (!storeNode) throw new Error('No commerce store node found.');

        const storeData = storeNode.data as any;
        const pct = input.discountPercent || 15;
        const discountTotal = (storeData.subtotal * pct) / 100;
        const total = storeData.subtotal - discountTotal;

        const updatedData = {
          ...storeData,
          appliedPromoCode: input.promoCode,
          discountTotal: Math.round(discountTotal * 100) / 100,
          total: Math.round(total * 100) / 100,
          isAgentModified: true,
        };

        setNodes((prev) =>
          prev.map((n) => (n.id === storeNode.id ? { ...n, data: updatedData } : n))
        );

        confetti({ particleCount: 70, spread: 80, origin: { y: 0.7 } });

        return {
          status: 'success',
          appliedPromoCode: input.promoCode,
          discountPercent: pct,
          discountAmount: updatedData.discountTotal,
          newTotal: updatedData.total,
        };
      },
    });

    // Tool 5: create_canvas_element
    const unregCreate = globalModelContext.registerTool({
      name: 'create_canvas_element',
      description: 'Spawn a new node card on the infinite visual canvas.',
      inputSchema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['ui_component', 'chart', 'data_table', 'api_connector', 'markdown_doc', 'workflow_action'],
            description: 'Type of node to create',
          },
          title: { type: 'string', description: 'Title of the new node' },
          content: { type: 'string', description: 'Optional initial text content or markdown' },
        },
        required: ['type', 'title'],
      },
      category: 'canvas',
      execute: async (input: { type: NodeType; title: string; content?: string }) => {
        const newNode: CanvasNode = {
          id: `node-${Date.now()}`,
          type: input.type,
          position: { x: 250 + Math.random() * 200, y: 180 + Math.random() * 150 },
          dimensions: { width: 500, height: 380 },
          data: {
            title: input.title,
            description: `Generated by WebMCP Autonomous Agent`,
            themeColor: '#38bdf8',
            isAgentModified: true,
            author: 'WebMCP Agent',
            tags: ['AI-Created', 'WebMCP'],
            content: input.content || '### New Component Created via WebMCP Tool',
          } as any,
        };

        setNodes((prev) => [...prev, newNode]);
        return { status: 'created', nodeId: newNode.id, title: input.title };
      },
    });

    // Tool 6: update_canvas_element
    const unregUpdate = globalModelContext.registerTool({
      name: 'update_canvas_element',
      description: 'Mutate properties, title, theme, or state of an existing canvas node.',
      inputSchema: {
        type: 'object',
        properties: {
          nodeId: { type: 'string', description: 'ID of target node to update' },
          properties: { type: 'object', description: 'Key-value map of properties to merge' },
        },
        required: ['nodeId'],
      },
      category: 'canvas',
      execute: async (input: { nodeId: string; properties?: Record<string, unknown> }) => {
        setNodes((prev) =>
          prev.map((n) =>
            n.id === input.nodeId
              ? {
                  ...n,
                  isExecuting: false,
                  data: { ...n.data, ...(input.properties || {}), isAgentModified: true },
                }
              : n
          )
        );
        return { status: 'updated', nodeId: input.nodeId };
      },
    });

    // Tool 7: delete_canvas_element (with safety confirmation guard)
    const unregDelete = globalModelContext.registerTool({
      name: 'delete_canvas_element',
      description: 'Destructively remove a node from the canvas (Triggers human confirmation).',
      requiresConfirmation: true,
      inputSchema: {
        type: 'object',
        properties: {
          nodeId: { type: 'string', description: 'ID of node to delete' },
        },
        required: ['nodeId'],
      },
      category: 'canvas',
      execute: async (input: { nodeId: string }) => {
        setNodes((prev) => prev.filter((n) => n.id !== input.nodeId));
        setEdges((prev) => prev.filter((e) => e.sourceNodeId !== input.nodeId && e.targetNodeId !== input.nodeId));
        return { status: 'deleted', nodeId: input.nodeId };
      },
    });

    // Tool 8: query_edge_telemetry (Cloudflare Workers WebMCP)
    const unregTelemetry = globalModelContext.registerTool({
      name: 'query_edge_telemetry',
      description: 'Query Cloudflare edge request metrics, RPS, and anomaly logs.',
      inputSchema: {
        type: 'object',
        properties: {
          timeRange: { type: 'string', default: '30m' },
          metric: { type: 'string', default: 'requests_and_errors' },
        },
      },
      category: 'data',
      execute: async (input: { timeRange?: string; metric?: string }) => {
        return {
          provider: 'Cloudflare Browser Run & Edge Workers',
          timeRange: input.timeRange || '30m',
          avgLatencyMs: 14.8,
          p99LatencyMs: 42.1,
          totalRequests: 849200,
          errorRatePercent: 0.12,
          anomaliesDetected: [
            { pop: 'SIN (Singapore)', code: 504, description: 'Gateway timeout spike resolved' },
          ],
        };
      },
    });

    // Tool 9: generate_react_component (Vercel / React 19 WebMCP)
    const unregGenComponent = globalModelContext.registerTool({
      name: 'generate_react_component',
      description: 'Synthesize interactive React 19 UI component with Tailwind CSS.',
      inputSchema: {
        type: 'object',
        properties: {
          componentType: { type: 'string', enum: ['pricing', 'counter', 'newsletter', 'hero'], default: 'pricing' },
          theme: { type: 'string', default: 'cyber-dark' },
        },
      },
      category: 'ui',
      execute: async (input: { componentType: 'pricing' | 'counter' | 'newsletter' | 'hero'; theme?: string }) => {
        const uiNode = nodesRef.current.find((n) => n.type === 'ui_component');
        if (uiNode) {
          setNodes((prev) =>
            prev.map((n) =>
              n.id === uiNode.id
                ? {
                    ...n,
                    data: {
                      ...n.data,
                      componentType: input.componentType,
                      isAgentModified: true,
                    } as any,
                  }
                : n
            )
          );
        }
        return { status: 'synthesized', componentType: input.componentType };
      },
    });

    // Tool 10: triage_support_tickets (Support Ops WebMCP)
    const unregTriage = globalModelContext.registerTool({
      name: 'triage_support_tickets',
      description: 'Auto-classify customer tickets and dispatch escalation webhooks.',
      inputSchema: {
        type: 'object',
        properties: {
          autoResolvePositive: { type: 'boolean', default: true },
          escalateCritical: { type: 'boolean', default: true },
        },
      },
      category: 'workflow',
      execute: async () => {
        return {
          triagedTicketsCount: 4,
          escalated: ['#TK-902 (Sarah Connor - P0 Critical)'],
          autoResolved: ['#TK-903 (David Kim - Positive)'],
          webhookDispatched: true,
        };
      },
    });

    // Cleanup unregister on unmount
    return () => {
      unregState();
      unregSearch();
      unregCart();
      unregDiscount();
      unregCreate();
      unregUpdate();
      unregDelete();
      unregTelemetry();
      unregGenComponent();
      unregTriage();
    };
  }, [activePresetId]);

  // Switch Preset
  const handleSelectPreset = (presetId: string) => {
    const preset = WORKSPACE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setActivePresetId(presetId);
    setNodes(preset.nodes);
    setEdges(preset.edges);
    setSelectedNodeId(null);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.1 } });
  };

  const handleResetCanvas = () => {
    setNodes(activePreset.nodes);
    setEdges(activePreset.edges);
    setSelectedNodeId(null);
  };

  const handleAddNode = (type: NodeType) => {
    const newNode: CanvasNode = {
      id: `node-${Date.now()}`,
      type,
      position: { x: 200 + Math.random() * 200, y: 150 + Math.random() * 150 },
      dimensions: { width: 500, height: 380 },
      data: {
        title: `Custom ${type.replace('_', ' ').toUpperCase()}`,
        description: 'Created by user on infinite canvas',
        themeColor: '#38bdf8',
        ...(type === 'chart'
          ? { chartType: 'bar', dataPoints: [{ label: 'Q1', value: 340 }, { label: 'Q2', value: 580 }] }
          : type === 'data_table'
          ? {
              columns: [{ key: 'id', label: 'ID', type: 'text' }, { key: 'name', label: 'Name', type: 'text' }],
              rows: [{ id: '1', name: 'Item Alpha' }, { id: '2', name: 'Item Beta' }],
            }
          : type === 'ui_component'
          ? { componentType: 'pricing', jsxCode: '<div>Custom Component</div>', props: {}, state: {} }
          : type === 'api_connector'
          ? { endpointUrl: 'https://api.example.com/data', method: 'GET', mockMode: true }
          : { content: 'Custom note details...', author: 'User', tags: ['UserCreated'] }),
      } as any,
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
  };

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-[#080c14] text-slate-100 font-['Inter',sans-serif]">
      {/* Top Navigation Bar */}
      <Header
        presets={WORKSPACE_PRESETS}
        activePresetId={activePresetId}
        onSelectPreset={handleSelectPreset}
        onOpenInspector={() => setIsInspectorOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onResetCanvas={handleResetCanvas}
        isCopilotOpen={isCopilotOpen}
        onToggleCopilot={() => setIsCopilotOpen(!isCopilotOpen)}
        activeToolsCount={tools.length}
      />

      {/* Main Canvas + Sidebar Area */}
      <div className="flex-1 relative overflow-hidden flex">
        <InfiniteCanvas
          nodes={nodes}
          edges={edges}
          onUpdateNodes={setNodes}
          onUpdateEdges={setEdges}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          onAddNode={handleAddNode}
        />

        {/* Right Co-Pilot Sidebar */}
        <AgentChatSidebar
          isOpen={isCopilotOpen}
          onToggle={() => setIsCopilotOpen(!isCopilotOpen)}
          suggestedPrompts={activePreset.suggestedPrompts}
          activePresetTitle={activePreset.title}
        />
      </div>

      {/* WebMCP Inspector & DevTools Modal */}
      <WebMCPInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        nodes={nodes}
        edges={edges}
      />

      {/* Safety Human-in-the-Loop Confirmation Modal */}
      <SafetyConfirmationModal
        isOpen={safetyModalState.isOpen}
        toolName={safetyModalState.toolName}
        toolInput={safetyModalState.toolInput}
        onConfirm={() => {
          safetyModalState.resolver?.(true);
          setSafetyModalState((prev) => ({ ...prev, isOpen: false }));
        }}
        onReject={() => {
          safetyModalState.resolver?.(false);
          setSafetyModalState((prev) => ({ ...prev, isOpen: false }));
        }}
      />
    </div>
  );
}

export default App;
