import { WorkspacePreset } from '../../types/canvas';

export const WORKSPACE_PRESETS: WorkspacePreset[] = [
  {
    id: 'ecommerce-shopify',
    title: 'Shopify Agentic Commerce',
    subtitle: 'Autonomous Catalog Search, Dynamic Cart & Price Negotiation',
    category: 'E-Commerce',
    icon: 'ShoppingBag',
    badge: 'Shopify WebMCP',
    suggestedPrompts: [
      'Search for noise cancelling headphones and add top rated one to cart',
      'Negotiate 15% promotional discount on the mechanical keyboard',
      'Calculate total with taxes and apply SUMMER2026 coupon',
      'Add OLED monitor and check inventory availability',
    ],
    nodes: [
      {
        id: 'node-store-1',
        type: 'commerce_cart',
        position: { x: 120, y: 120 },
        dimensions: { width: 520, height: 580 },
        data: {
          title: 'Shopify Storefront & Agent Cart',
          description: 'Live store catalog with WebMCP search_products and modify_cart tools',
          themeColor: '#10B981',
          storeName: 'HyperTech Gear',
          currency: 'USD',
          products: [
            {
              id: 'prod-1',
              title: 'Apex Ultra Wireless ANC Headphones',
              price: 249.99,
              originalPrice: 299.99,
              category: 'Audio',
              inventoryCount: 14,
              rating: 4.9,
              image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
              description: 'Active noise cancellation, 40h battery, spatial audio driver.',
              badge: 'Best Seller',
            },
            {
              id: 'prod-2',
              title: 'Quantum Pro Mechanical Keyboard',
              price: 159.0,
              originalPrice: 189.0,
              category: 'Peripherals',
              inventoryCount: 8,
              rating: 4.8,
              image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80',
              description: 'Hot-swappable switches, gasket mount, RGB backlight.',
              badge: 'Top Rated',
            },
            {
              id: 'prod-3',
              title: 'VisionEdge 34" Curved OLED Monitor',
              price: 799.0,
              originalPrice: 899.0,
              category: 'Monitors',
              inventoryCount: 5,
              rating: 4.95,
              image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80',
              description: '240Hz refresh rate, 0.03ms response time, 99% DCI-P3.',
              badge: 'Staff Pick',
            },
            {
              id: 'prod-4',
              title: 'CyberMouse Pro Wireless Ergo',
              price: 89.99,
              originalPrice: 99.99,
              category: 'Peripherals',
              inventoryCount: 22,
              rating: 4.7,
              image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80',
              description: 'Ultralight 58g body, 30K optical sensor, PTFE feet.',
            },
          ],
          cart: [
            {
              product: {
                id: 'prod-1',
                title: 'Apex Ultra Wireless ANC Headphones',
                price: 249.99,
                originalPrice: 299.99,
                category: 'Audio',
                inventoryCount: 14,
                rating: 4.9,
                image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
                description: 'Active noise cancellation, 40h battery, spatial audio driver.',
                badge: 'Best Seller',
              },
              quantity: 1,
            },
          ],
          discountTotal: 0,
          subtotal: 249.99,
          total: 249.99,
        },
      },
      {
        id: 'node-chart-1',
        type: 'chart',
        position: { x: 680, y: 120 },
        dimensions: { width: 440, height: 320 },
        data: {
          title: 'Store Revenue & Conversion Velocity',
          description: 'Real-time sales velocity triggered by agent interactions',
          themeColor: '#3B82F6',
          chartType: 'area',
          xAxisLabel: 'Time of Day',
          yAxisLabel: 'Sales ($)',
          isLiveStreaming: true,
          dataPoints: [
            { label: '09:00', value: 1240 },
            { label: '11:00', value: 2450 },
            { label: '13:00', value: 3100 },
            { label: '15:00', value: 4890 },
            { label: '17:00', value: 6200 },
            { label: '19:00', value: 7850 },
          ],
        },
      },
      {
        id: 'node-action-1',
        type: 'workflow_action',
        position: { x: 680, y: 470 },
        dimensions: { width: 440, height: 230 },
        data: {
          title: 'Automated Checkout & Loyalty Reward',
          description: 'Executes webhook to fulfill orders and apply VIP cashback',
          themeColor: '#8B5CF6',
          actionType: 'webhook',
          triggerCondition: 'cart.total > 200',
          executionCount: 18,
          lastExecutionStatus: 'success',
          config: {
            endpoint: 'https://api.hypertech.io/v1/orders/webhook',
            autoFulfill: true,
            sendSlackNotification: true,
          },
        },
      },
    ],
    edges: [
      {
        id: 'edge-store-to-chart',
        sourceNodeId: 'node-store-1',
        targetNodeId: 'node-chart-1',
        label: 'Sales Stream',
        animated: true,
      },
      {
        id: 'edge-store-to-action',
        sourceNodeId: 'node-store-1',
        targetNodeId: 'node-action-1',
        label: 'Checkout Trigger',
        animated: true,
      },
    ],
  },
  {
    id: 'analytics-cloudflare',
    title: 'Cloudflare Edge Analytics & Telemetry',
    subtitle: 'Real-Time Edge Traffic, Anomaly Detection & Worker Diagnostics',
    category: 'Analytics & Data',
    icon: 'Activity',
    badge: 'Cloudflare Workers',
    suggestedPrompts: [
      'Analyze traffic spike and identify anomalous request patterns',
      'Filter data table to show HTTP 5xx errors in EU regions',
      'Generate a latency distribution chart for Edge Workers',
      'Trigger security mitigation action on suspicious IP subnet',
    ],
    nodes: [
      {
        id: 'node-cf-chart',
        type: 'chart',
        position: { x: 100, y: 100 },
        dimensions: { width: 500, height: 350 },
        data: {
          title: 'Edge Worker Request Volume (RPS)',
          description: 'Global distributed requests processed per second across 310+ cities',
          themeColor: '#F59E0B',
          chartType: 'line',
          xAxisLabel: 'Minutes Ago',
          yAxisLabel: 'Requests/sec',
          isLiveStreaming: true,
          dataPoints: [
            { label: '30m', value: 42000, secondaryValue: 120 },
            { label: '25m', value: 46500, secondaryValue: 140 },
            { label: '20m', value: 51200, secondaryValue: 135 },
            { label: '15m', value: 78900, secondaryValue: 480 },
            { label: '10m', value: 64200, secondaryValue: 210 },
            { label: '5m', value: 58000, secondaryValue: 160 },
            { label: 'Now', value: 62400, secondaryValue: 155 },
          ],
        },
      },
      {
        id: 'node-cf-table',
        type: 'data_table',
        position: { x: 640, y: 100 },
        dimensions: { width: 580, height: 420 },
        data: {
          title: 'Edge Telemetry & Anomaly Log',
          description: 'Live Cloudflare Browser Run and Workers logs queryable via WebMCP',
          themeColor: '#3B82F6',
          columns: [
            { key: 'colo', label: 'PoP Location', type: 'badge' },
            { key: 'path', label: 'Endpoint Path', type: 'text' },
            { key: 'status', label: 'Status', type: 'badge' },
            { key: 'latency', label: 'Latency (ms)', type: 'number' },
            { key: 'rps', label: 'Traffic RPS', type: 'number' },
          ],
          rows: [
            { colo: 'SJC (San Jose)', path: '/api/v1/modelContext', status: '200 OK', latency: 8, rps: 18400 },
            { colo: 'FRA (Frankfurt)', path: '/api/v1/modelContext', status: '200 OK', latency: 12, rps: 14200 },
            { colo: 'LHR (London)', path: '/api/v1/tools/execute', status: '200 OK', latency: 14, rps: 12900 },
            { colo: 'NRT (Tokyo)', path: '/api/v1/tools/execute', status: '200 OK', latency: 19, rps: 9800 },
            { colo: 'SIN (Singapore)', path: '/api/v1/query', status: '504 Gateway', latency: 450, rps: 4200 },
            { colo: 'SYD (Sydney)', path: '/api/v1/stream', status: '200 OK', latency: 26, rps: 2900 },
          ],
        },
      },
      {
        id: 'node-cf-api',
        type: 'api_connector',
        position: { x: 100, y: 480 },
        dimensions: { width: 500, height: 260 },
        data: {
          title: 'Cloudflare Browser Run MCP Endpoint',
          description: 'Direct WebMCP execution endpoint on Cloudflare Workers',
          themeColor: '#10B981',
          endpointUrl: 'https://edge.webmcp-challenge.workers.dev/v1/mcp',
          method: 'POST',
          mockMode: true,
          lastResponse: {
            status: 200,
            timestamp: Date.now(),
            data: { status: 'healthy', region: 'iad01', activeTools: 7, avgP99Ms: 14.2 },
          },
        },
      },
    ],
    edges: [
      {
        id: 'edge-api-to-chart',
        sourceNodeId: 'node-cf-api',
        targetNodeId: 'node-cf-chart',
        label: 'Metric Feed',
        animated: true,
      },
      {
        id: 'edge-chart-to-table',
        sourceNodeId: 'node-cf-chart',
        targetNodeId: 'node-cf-table',
        label: 'Anomaly Pipe',
        animated: true,
      },
    ],
  },
  {
    id: 'app-builder-live',
    title: 'Live Agentic UI App Builder',
    subtitle: 'Co-Design Responsive Components, Styling & Dynamic States with AI',
    category: 'Web Apps',
    icon: 'Layout',
    badge: 'Vercel / React 19',
    suggestedPrompts: [
      'Generate a sleek pricing card component with toggle for monthly/annual',
      'Change theme colors to Neon Cyberpunk with violet gradients',
      'Create an interactive counter with increment, decrement and reset buttons',
      'Build a newsletter subscription card with email validation',
    ],
    nodes: [
      {
        id: 'node-ui-preview',
        type: 'ui_component',
        position: { x: 120, y: 100 },
        dimensions: { width: 540, height: 480 },
        data: {
          title: 'Live Interactive Component Sandbox',
          description: 'Sandboxed React component generated & mutated live by WebMCP agent',
          themeColor: '#8B5CF6',
          componentType: 'pricing',
          jsxCode: `
<div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 to-indigo-950/60 border border-indigo-500/30 shadow-2xl backdrop-blur-xl">
  <div className="flex items-center justify-between mb-4">
    <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300 bg-cyan-500/10 rounded-full border border-cyan-500/30">
      ⚡ WebMCP Pro Plan
    </span>
    <span className="text-2xl font-extrabold text-white">$49<span className="text-sm font-normal text-slate-400">/mo</span></span>
  </div>
  <h3 className="text-xl font-bold text-white mb-2">Agent Native Full-Stack</h3>
  <p className="text-sm text-slate-300 mb-6">Autonomous tools, real-time visual canvas sync, infinite scalability.</p>
  <ul className="space-y-2 mb-6 text-sm text-slate-300">
    <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Full WebMCP Specification Support</li>
    <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Instant Chrome 149+ & ChatGPT Integration</li>
    <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Unlimited Autonomous Tool Executions</li>
  </ul>
  <button className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-semibold text-white shadow-lg hover:shadow-cyan-500/25 transition-all">
    Deploy Application Now
  </button>
</div>
          `.trim(),
          props: { plan: 'Pro', price: 49 },
          state: { activeBillingCycle: 'monthly' },
        },
      },
      {
        id: 'node-doc-guide',
        type: 'markdown_doc',
        position: { x: 700, y: 100 },
        dimensions: { width: 480, height: 480 },
        data: {
          title: 'Component Blueprint & Docs',
          description: 'Live architecture documentation maintained by WebMCP agent',
          themeColor: '#EC4899',
          author: 'AgentStudio Co-Pilot',
          tags: ['React 19', 'Tailwind', 'WebMCP', 'Vercel'],
          content: `### 🚀 WebMCP Architecture Specification

This component is connected to the live **\`generate_react_component\`** and **\`mutate_element_props\`** WebMCP tools.

- **Dynamic State:** State changes in the visual component trigger real-time tool updates.
- **Bi-directional Binding:** The agent can modify JSX, Tailwind utility classes, and internal props.
- **Chrome 149+ Bridge:** Registered on \`document.modelContext\` for seamless ChatGPT desktop or Chrome agent access.
          `.trim(),
        },
      },
    ],
    edges: [
      {
        id: 'edge-ui-to-doc',
        sourceNodeId: 'node-ui-preview',
        targetNodeId: 'node-doc-guide',
        label: 'Live Props Sync',
        animated: true,
      },
    ],
  },
  {
    id: 'support-ops-triage',
    title: 'Customer Ops & Triage Engine',
    subtitle: 'Agentic Ticket Analysis, Sentiment Triage & Auto Resolution',
    category: 'Support & Ops',
    icon: 'Headphones',
    badge: 'Render & Netlify',
    suggestedPrompts: [
      'Triage all high priority tickets and draft empathetic responses',
      'Identify tickets with negative sentiment and escalate to VIP queue',
      'Trigger webhook to send resolved ticket notifications',
    ],
    nodes: [
      {
        id: 'node-triage-table',
        type: 'data_table',
        position: { x: 120, y: 120 },
        dimensions: { width: 560, height: 420 },
        data: {
          title: 'Incoming Customer Tickets Queue',
          description: 'Live support tickets stream with sentiment tags',
          themeColor: '#3B82F6',
          columns: [
            { key: 'id', label: 'Ticket ID', type: 'text' },
            { key: 'customer', label: 'Customer', type: 'text' },
            { key: 'sentiment', label: 'Sentiment', type: 'badge' },
            { key: 'priority', label: 'Priority', type: 'badge' },
            { key: 'status', label: 'Status', type: 'badge' },
          ],
          rows: [
            { id: '#TK-902', customer: 'Sarah Connor', sentiment: 'Critical', priority: 'P0 - Urgent', status: 'Pending Triage' },
            { id: '#TK-903', customer: 'David Kim', sentiment: 'Positive', priority: 'P2 - Normal', status: 'Auto-Resolved' },
            { id: '#TK-904', customer: 'Elena Rostova', sentiment: 'Neutral', priority: 'P1 - High', status: 'In Review' },
            { id: '#TK-905', customer: 'Alex Chen', sentiment: 'Frustrated', priority: 'P1 - High', status: 'Pending Triage' },
          ],
        },
      },
      {
        id: 'node-triage-action',
        type: 'workflow_action',
        position: { x: 720, y: 120 },
        dimensions: { width: 440, height: 260 },
        data: {
          title: 'Escalation Webhook Dispatcher',
          description: 'Notifies Tier-3 engineering on P0 ticket detection',
          themeColor: '#EF4444',
          actionType: 'webhook',
          triggerCondition: 'priority == "P0 - Urgent"',
          executionCount: 7,
          lastExecutionStatus: 'idle',
          config: {
            slackChannel: '#support-critical',
            pagerDutyNotify: true,
          },
        },
      },
    ],
    edges: [
      {
        id: 'edge-triage-to-action',
        sourceNodeId: 'node-triage-table',
        targetNodeId: 'node-triage-action',
        label: 'P0 Escalation',
        animated: true,
      },
    ],
  },
];
