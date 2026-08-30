# ⚡ AgentStudio WebMCP

> **Agent-Native Collaborative Visual Workspace & Application Orchestrator powered by the WebMCP (Web Model Context Protocol) Standard.**  
> Built for the **OpenAI WebMCP Challenge** (Devpost 2026).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![WebMCP Standard](https://img.shields.io/badge/WebMCP-v1.0.0-cyan)](https://github.com/webmachinelearning/webmcp)
[![Chrome 149+](https://img.shields.io/badge/Chrome-149%2B_Flag_Ready-green)](chrome://flags/#enable-webmcp-testing)
[![React 19](https://img.shields.io/badge/React-19-blue)](https://react.dev)
[![OpenAI ChatGPT Browser](https://img.shields.io/badge/ChatGPT-In--App_Browser_Native-purple)](https://chatgpt.com)

---

## 📑 Table of Contents
1. [Executive Summary & Problem Statement](#-executive-summary--problem-statement)
2. [Why WebMCP is the Perfect Fit](#-why-webmcp-is-the-perfect-fit)
3. [Human-Agent Co-Creation: What Was Impossible Before](#-human-agent-co-creation-what-was-impossible-before)
4. [Architecture & WebMCP Implementation](#-architecture--webmcp-implementation)
5. [Complete WebMCP Tool Catalog & Schemas](#-complete-webmcp-tool-catalog--schemas)
6. [Security & Human-in-the-Loop Trust Boundaries](#-security--human-in-the-loop-trust-boundaries)
7. [Industry Workspace Presets](#-industry-workspace-presets)
8. [Hackathon Supporter Integrations](#-hackathon-supporter-integrations)
9. [Judge Testing & Quickstart Guide](#-judge-testing--quickstart-guide)
10. [Open Source License](#-open-source-license)

---

## 🎯 Executive Summary & Problem Statement

For two decades, web applications were designed exclusively for human eyes clicking DOM elements. When autonomous AI agents attempt to interact with web pages, they are forced to rely on fragile headless browser scraping, heuristic CSS selectors, or vision screenshot analysis. This causes:
- **High latency & compute waste** (taking screenshots of DOM).
- **Fragile workflows** (any CSS class update breaks the agent).
- **Zero bi-directional synchronization** (agents cannot expose state or co-create with humans in real time).

**AgentStudio WebMCP** solves this by establishing a direct, structured communication bridge between web applications and AI agents via **WebMCP** (`document.modelContext`).

Instead of scraping HTML, agents running in Google Chrome 149+ or the ChatGPT in-app browser query and execute typed JavaScript tools registered on the page. Humans and agents share a visual infinite canvas, allowing real-time collaborative application building, e-commerce cart composition, cloud telemetry monitoring, and customer ops triage.

---

## 💡 Why WebMCP is the Perfect Fit

1. **Zero-Overhead Structured Contract**: Rather than parsing unstructured DOM trees, the agent receives declarative JSON Schema definitions for every capability available on the page.
2. **Instant Reactive State Updates**: When an agent executes a WebMCP tool (e.g., `modify_cart` or `apply_discount`), the visual canvas updates reactively in 0ms without page reloads.
3. **Multi-Domain Composition**: WebMCP allows disparate capabilities (Shopify store catalogs, Cloudflare edge logs, Vercel React components) to be unified under a single model context.
4. **Native Browser Standard**: Conforms directly with W3C / WebML standards and Chrome's `chrome://flags/#enable-webmcp-testing` specification.

---

## 🤝 Human-Agent Co-Creation: What Was Impossible Before

| Traditional Web Experience | With AgentStudio WebMCP |
|---|---|
| Human manually searches catalogs, compares items, copies coupon codes. | Agent searches catalog via `search_products`, adds items via `modify_cart`, and negotiates discounts via `apply_discount` while human monitors live canvas. |
| DevOps engineers manually write PromQL queries and inspect logs. | Agent inspects edge telemetry via `query_edge_telemetry`, detects 5xx spikes, and highlights anomalous nodes on canvas. |
| Developers manually write boilerplate React cards and styling. | Agent synthesizes interactive JSX components live via `generate_react_component` with hot-reloaded canvas preview. |
| Blind agent actions causing accidental data deletion. | Sensitive tools trigger **Human-in-the-Loop safety boundaries** before execution. |

---

## 🏗️ Architecture & WebMCP Implementation

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          User Browser Session                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    AgentStudio Visual Canvas                      │  │
│  │  [Shopify Storefront] ───► [Edge Telemetry] ───► [Live UI Card]   │  │
│  └─────────────────────────────────┬─────────────────────────────────┘  │
│                                    │ Reactive State Sync                 │
│  ┌─────────────────────────────────▼─────────────────────────────────┐  │
│  │              document.modelContext (WebMCP Standard)              │  │
│  │  ├── search_products            ├── query_edge_telemetry          │  │
│  │  ├── modify_cart                ├── generate_react_component      │  │
│  │  ├── apply_discount             ├── triage_support_tickets        │  │
│  │  ├── get_workspace_state        ├── delete_canvas_element (Guarded│  │
│  │  └── create_canvas_element      └── update_canvas_element         │  │
│  └─────────────────────────────────▲─────────────────────────────────┘  │
│                                    │ Native Protocol Bridge              │
└────────────────────────────────────┼────────────────────────────────────┘
                                     │
       ┌─────────────────────────────┴─────────────────────────────┐
       │                                                           │
┌──────▼───────────────────────────┐   ┌───────────────────────────▼──────┐
│       Google Chrome 149+         │   │      ChatGPT Desktop / Mobile    │
│  (#enable-webmcp-testing Flag)   │   │       In-App Browser Agent       │
└──────────────────────────────────┘   └──────────────────────────────────┘
```

### Core Code Snippet (Exact WebMCP Specification)

```typescript
import { globalModelContext } from './lib/webmcp/modelContextPolyfill';

// 1. Register WebMCP tool with typed JSON Schema
document.modelContext.registerTool({
  name: "search_products",
  description: "Search product catalog in active store node with keyword query and filters.",
  inputSchema: {
    type: "object",
    properties: {
      query: { 
        type: "string", 
        description: "Product search keyword (e.g. headphones, keyboard)" 
      },
      maxResults: { 
        type: "number", 
        description: "Maximum products to return", 
        default: 5 
      }
    },
    required: ["query"]
  },
  execute: async (input: { query: string; maxResults?: number }) => {
    const products = getActiveCatalog();
    const matches = products.filter(p => 
      p.title.toLowerCase().includes(input.query.toLowerCase())
    );
    return {
      query: input.query,
      totalMatches: matches.length,
      products: matches.slice(0, input.maxResults || 5)
    };
  }
});
```

---

## 🛠️ Complete WebMCP Tool Catalog & Schemas

| Tool Name | Domain | Input Parameters | Output Summary | Safety Guard |
|---|---|---|---|:---:|
| `get_workspace_state` | Canvas | None (`{}`) | Returns structured JSON graph of nodes, edges, active preset | Auto |
| `search_products` | Commerce | `query` (string), `maxResults` (number) | Returns matched catalog products with prices and inventory | Auto |
| `modify_cart` | Commerce | `action` ('add'\|'remove'\|'clear'), `productId`, `quantity` | Mutates live shopping cart session and recalculates totals | Auto |
| `apply_discount` | Commerce | `promoCode` (string), `discountPercent` (number) | Negotiates price discount, updates canvas total, fires confetti | Auto |
| `create_canvas_element` | Canvas | `type` (string), `title` (string), `content` (string) | Spawns new visual node card on infinite canvas | Auto |
| `update_canvas_element` | Canvas | `nodeId` (string), `properties` (object) | Mutates position, title, theme, or state of a node | Auto |
| `delete_canvas_element` | Canvas | `nodeId` (string) | Destructively deletes node from canvas | 🛡️ **Human Approval Required** |
| `query_edge_telemetry` | Data | `timeRange` (string), `metric` (string) | Fetches Cloudflare edge RPS, latency, and anomaly logs | Auto |
| `generate_react_component`| UI | `componentType` ('pricing'\|'counter'\|'newsletter'), `theme` | Synthesizes interactive React 19 JSX component | Auto |
| `triage_support_tickets` | Workflow| `autoResolvePositive` (bool), `escalateCritical` (bool) | Classifies customer sentiment and triggers alert webhooks | Auto |

---

## 🛡️ Security & Human-in-the-Loop Trust Boundaries

Following the **WebMCP Tool Security Guide**, tools with destructive or financial side effects require explicit user verification.

When an agent attempts to call `delete_canvas_element` or execute unauthorized mutations:
1. WebMCP engine intercepts execution.
2. An interactive **Human-in-the-Loop Modal** opens displaying the exact tool name and parameter payload.
3. The user can **Approve** or **Reject** the action. Rejected actions return an explicit rejection error to the agent, preserving system safety.

---

## 🎨 Industry Workspace Presets

AgentStudio includes 4 pre-configured domain environments accessible via the top navigation bar:

1. **🛍️ Shopify Agentic Commerce (`Shopify WebMCP`)**:
   - Product catalog search, dynamic shopping cart session, price negotiation, and automated VIP checkout triggers.
2. **🌐 Cloudflare Edge Analytics (`Cloudflare Workers`)**:
   - Real-time RPS graphs, global PoP latency distribution, and anomaly mitigation pipelines.
3. **⚡ Live React App Builder (`Vercel / React 19`)**:
   - Live interactive sandboxed components (Pricing cards, Counters, Newsletters) with JSX hot-reloading.
4. **🎧 Customer Ops & Support Triage (`Render & Netlify`)**:
   - Sentiment classification, P0 urgent ticket triage, and automated webhook dispatching.

---

## 🌟 Hackathon Supporter Integrations

- **OpenAI**: Native ChatGPT in-app browser tool binding and autonomous reasoning loop.
- **Google Chrome**: Full compliance with Chrome 149+ `#enable-webmcp-testing` and `useWebMCPTool` React hook standard.
- **Shopify**: WebMCP agent-focused commerce catalog and cart tools.
- **Cloudflare**: Telemetry pipeline and Browser Run integration.
- **Vercel**: React 19 frontend builder and deployment target.
- **Netlify & Render**: Automated workflow dispatching and serverless action webhooks.

---

## 🚀 Judge Testing & Quickstart Guide

### 1. Run Locally (Fastest)
```bash
git clone https://github.com/aqeelabpro/webmcp-agentstudio.git
cd webmcp-agentstudio
npm install
npm run dev
```
Open **`http://localhost:5173`**.

### 2. Testing in Google Chrome 149+ with WebMCP Flag
1. Open Google Chrome 149+.
2. Navigate to `chrome://flags/#enable-webmcp-testing`.
3. Set to **Enabled** and restart Chrome.
4. Open `http://localhost:5173`.
5. Press `F12` -> Console, and test directly:
```javascript
// Inspect registered tools
console.log(document.modelContext.getRegisteredTools());

// Execute search tool
await document.modelContext.executeTool("search_products", { query: "headphones" });

// Execute cart modification
await document.modelContext.executeTool("modify_cart", { action: "add", productId: "prod-1", quantity: 1 });
```

### 3. Testing with Built-in WebMCP DevTools (Any Browser)
1. Click the **"10 Tools Bound"** button in the top navigation header.
2. In the **Registered Tools** tab: inspect JSON Schemas.
3. In the **Manual Tool Tester** tab: pick a tool, enter JSON payload, and click **Execute Tool**.
4. In the **Invocation Logs** tab: inspect live execution latency and input/output audit trail.

---

## 📜 Open Source License

This project is open-source and released under the [MIT License](./LICENSE).  
Copyright (c) 2026 aqeelabpro & AgentStudio Contributors.
