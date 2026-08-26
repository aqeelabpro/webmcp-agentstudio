export type NodeType =
  | 'ui_component'
  | 'chart'
  | 'data_table'
  | 'api_connector'
  | 'commerce_cart'
  | 'workflow_action'
  | 'agent_terminal'
  | 'markdown_doc';

export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface BaseNodeData {
  title: string;
  description?: string;
  themeColor?: string;
  isAgentModified?: boolean;
  lastModifiedBy?: 'user' | 'agent' | 'system';
  lastModifiedAt?: number;
}

export interface UiComponentNodeData extends BaseNodeData {
  componentType: 'card' | 'form' | 'stats' | 'pricing' | 'hero' | 'custom_jsx';
  jsxCode: string;
  props: Record<string, unknown>;
  state: Record<string, unknown>;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  color?: string;
}

export interface ChartNodeData extends BaseNodeData {
  chartType: 'bar' | 'line' | 'doughnut' | 'area';
  dataPoints: ChartDataPoint[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  refreshIntervalSeconds?: number;
  isLiveStreaming?: boolean;
}

export interface DataTableColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'badge' | 'currency' | 'date';
}

export interface DataTableNodeData extends BaseNodeData {
  columns: DataTableColumn[];
  rows: Record<string, unknown>[];
  filterQuery?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface ApiConnectorNodeData extends BaseNodeData {
  endpointUrl: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  payloadTemplate?: string;
  lastResponse?: {
    status: number;
    data: unknown;
    timestamp: number;
  };
  mockMode: boolean;
}

export interface CommerceProduct {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  category: string;
  inventoryCount: number;
  rating: number;
  image: string;
  description: string;
  badge?: string;
}

export interface CartItem {
  product: CommerceProduct;
  quantity: number;
  appliedDiscountPercent?: number;
}

export interface CommerceNodeData extends BaseNodeData {
  storeName: string;
  currency: string;
  products: CommerceProduct[];
  cart: CartItem[];
  appliedPromoCode?: string;
  discountTotal: number;
  subtotal: number;
  total: number;
}

export interface WorkflowActionNodeData extends BaseNodeData {
  actionType: 'webhook' | 'email_alert' | 'data_transform' | 'db_upsert';
  triggerCondition: string;
  config: Record<string, unknown>;
  executionCount: number;
  lastExecutionStatus?: 'idle' | 'running' | 'success' | 'failed';
}

export interface MarkdownDocNodeData extends BaseNodeData {
  content: string;
  author: string;
  tags: string[];
}

export interface AgentTerminalNodeData extends BaseNodeData {
  activeModel: string;
  taskGoal: string;
  currentStep: string;
  progressPercent: number;
  toolCallHistory: {
    toolName: string;
    input: Record<string, unknown>;
    timestamp: number;
    status: 'success' | 'failed';
  }[];
}

export type CanvasNodeData =
  | UiComponentNodeData
  | ChartNodeData
  | DataTableNodeData
  | ApiConnectorNodeData
  | CommerceNodeData
  | WorkflowActionNodeData
  | MarkdownDocNodeData
  | AgentTerminalNodeData;

export interface CanvasNode<TData = CanvasNodeData> {
  id: string;
  type: NodeType;
  position: Position;
  dimensions?: Dimensions;
  data: TData;
  selected?: boolean;
  isExecuting?: boolean;
  zIndex?: number;
}

export interface CanvasEdge {
  id: string;
  sourceNodeId: string;
  sourceHandle?: string;
  targetNodeId: string;
  targetHandle?: string;
  label?: string;
  animated?: boolean;
  style?: {
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
  };
}

export interface WorkspacePreset {
  id: string;
  title: string;
  subtitle: string;
  category: 'E-Commerce' | 'Analytics & Data' | 'Web Apps' | 'Support & Ops';
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  suggestedPrompts: string[];
  icon: string;
  badge: string;
}
