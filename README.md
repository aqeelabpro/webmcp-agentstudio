# ⚡ AgentStudio WebMCP

> **Agent-Native Collaborative Visual Workspace & Application Orchestrator powered by the WebMCP (Web Model Context Protocol) Standard.**
> Built for the **OpenAI WebMCP Challenge** (Devpost 2026).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![WebMCP Standard](https://img.shields.io/badge/WebMCP-v1.0.0-cyan)](https://github.com/webmachinelearning/webmcp)
[![Chrome 149+](https://img.shields.io/badge/Chrome-149%2B_Flag_Ready-green)](chrome://flags/#enable-webmcp-testing)
[![React 19](https://img.shields.io/badge/React-19-blue)](https://react.dev)
[![OpenAI ChatGPT Browser](https://img.shields.io/badge/ChatGPT-In--App_Browser_Native-purple)](https://chatgpt.com)

---

## 🌟 Overview & Concept

**AgentStudio** is a next-generation agent-human collaborative visual canvas where humans and AI agents interact, build, and orchestrate applications in real time.

Instead of passive chat screens or rigid dashboards, AgentStudio registers rich, typed tools directly on `document.modelContext` using the emerging **WebMCP** specification. Agents running inside ChatGPT's in-app browser or Chrome 149+ can seamlessly inspect workspace states, mutate canvas nodes, execute workflows, negotiate store discounts, analyze telemetry, and synthesize live React components.

---

## 🚀 WebMCP Core Implementation

AgentStudio implements the exact W3C / WebML / OpenAI WebMCP standard:

```typescript
// Standard WebMCP tool registration on document.modelContext
document.modelContext.registerTool({
  name: "search_products",
  description: "Search product catalog in active store node with keyword query and filters.",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Product search keyword (e.g. headphones, keyboard)" },
      maxResults: { type: "number", description: "Maximum products to return", default: 5 }
    },
    required: ["query"]
  },
  execute: async (input) => {
    // Dynamic execution logic against live canvas reactive state
    return {
      query: input.query,
      products: matchedProducts
    };
  }
});
```

### Registered WebMCP Tools

| Tool Name | Category | Description | Safety Guard |
|---|---|---|---|
| `get_workspace_state` | Canvas | Returns complete structured JSON graph of nodes and connections | Auto |
| `search_products` | Commerce | Searches Shopify-compatible catalog with keywords and filters | Auto |
| `modify_cart` | Commerce | Adds/removes items from the active customer shopping session | Auto |
| `apply_discount` | Commerce | Negotiates promotional discounts and recalculates cart totals | Auto |
| `create_canvas_element` | Canvas | Spawns UI cards, charts, API connectors, tables, or markdown docs | Auto |
| `update_canvas_element` | Canvas | Mutates properties, styling, and parameters of canvas nodes | Auto |
| `delete_canvas_element` | Canvas | Destructively removes nodes from canvas | 🛡️ **Human-in-the-Loop** |
| `query_edge_telemetry` | Data | Fetches real-time Cloudflare Edge latency, RPS, and anomaly logs | Auto |
| `generate_react_component`| UI | Synthesizes interactive React 19 JSX components with Tailwind | Auto |
| `triage_support_tickets` | Workflow | Classifies customer sentiment and dispatches alert webhooks | Auto |

---

## 🛠️ Key Features

1. **Infinite Visual Co-Creation Canvas**:
   - Draggable, zoomable workspace with interactive bezier connection lines and animated telemetry flow.
   - Live rendered nodes for Commerce, Analytics, Reactive UI Components, REST APIs, and Support Queues.

2. **WebMCP DevTools & Schema Inspector**:
   - Built-in floating inspector to view all registered tools on `document.modelContext`.
   - Real-time invocation audit log with millisecond latency metrics.
   - Interactive manual tool tester with JSON schema validation.

3. **Autonomous Agent Co-Pilot Sidebar**:
   - Embedded agent runner that directly calls `document.modelContext` tools.
   - Streams reasoning thought process and tool execution history into visual feed.

4. **Human-in-the-Loop Trust Boundaries**:
   - Compliant with the WebMCP Security Guide: Destructive tools (`delete_canvas_element`) trigger interactive user confirmation modals before execution.

5. **Multi-Domain Industry Presets**:
   - **Shopify Agentic Commerce**: Product discovery, dynamic cart composition, price negotiation.
   - **Cloudflare Edge Analytics**: Real-time traffic monitoring, anomaly detection, worker diagnostics.
   - **Live React App Builder**: Co-design responsive components with live hot-reloading.
   - **Customer Ops & Triage**: Sentiment classification, VIP escalations, automated webhooks.

6. **Export & Deploy Center**:
   - 1-click export of WebMCP Manifest JSON (`https://spec.webmcp.org/v1/schema.json`).
   - Standalone single-file HTML export.
   - Canvas Blueprint JSON for easy sharing.

---

## 🌐 Hackathon Supporter Alignment

- **OpenAI**: Native ChatGPT in-app browser tool calling support.
- **Google Chrome**: Full compliance with Chrome 149+ `#enable-webmcp-testing` and `useWebMCPTool` React hook standard.
- **Shopify**: WebMCP agent-focused commerce catalog and cart tools.
- **Cloudflare**: Telemetry pipeline and Browser Run integration.
- **Vercel**: React 19 frontend builder and deployment target.
- **Netlify & Render**: Automated workflow dispatching and serverless action webhooks.

---

## 💻 Quickstart & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Testing with Chrome WebMCP Flag
1. Open Google Chrome 149+.
2. Navigate to `chrome://flags/#enable-webmcp-testing`.
3. Set to **Enabled** and restart Chrome.
4. Open the application. WebMCP tools will be exposed natively to any connected agent.

### 4. Build for Production
```bash
npm run build
```

---

## 📜 Open Source License

This project is open-source and released under the [MIT License](./LICENSE).
