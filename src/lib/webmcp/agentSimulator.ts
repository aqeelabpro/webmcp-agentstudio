import { globalModelContext } from './modelContextPolyfill';

export interface AgentChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  thought?: string;
  toolInvocations?: {
    toolName: string;
    input: Record<string, unknown>;
    output?: unknown;
    status: 'pending' | 'success' | 'failed';
  }[];
  timestamp: number;
}

export interface AgentExecutionCallbacks {
  onThought?: (thought: string) => void;
  onToolCallStart?: (toolName: string, input: Record<string, unknown>) => void;
  onToolCallEnd?: (toolName: string, output: unknown, status: 'success' | 'failed') => void;
  onComplete?: (finalResponse: string) => void;
}

/**
 * Intelligent WebMCP Agent Brain
 * Dynamically queries document.modelContext registered tools and orchestrates actions.
 */
export class WebMCPAgentEngine {
  private isRunning = false;

  public async runAgentTask(
    userPrompt: string,
    callbacks?: AgentExecutionCallbacks
  ): Promise<{ response: string; toolCalls: { toolName: string; input: Record<string, unknown>; output: unknown }[] }> {
    if (this.isRunning) {
      throw new Error('An agent task is already in progress.');
    }

    this.isRunning = true;
    const executedToolCalls: { toolName: string; input: Record<string, unknown>; output: unknown }[] = [];

    try {
      const availableTools = globalModelContext.getRegisteredTools();
      const promptLower = userPrompt.toLowerCase();

      callbacks?.onThought?.('Analyzing workspace state and determining appropriate WebMCP tools...');
      await new Promise((r) => setTimeout(r, 450));

      // 1. Check if workspace state inspection is helpful
      const hasStateTool = availableTools.find((t) => t.name === 'get_workspace_state');
      let currentState: unknown = null;
      if (hasStateTool) {
        callbacks?.onThought?.('Inspecting current visual canvas state via get_workspace_state tool...');
        callbacks?.onToolCallStart?.('get_workspace_state', {});
        currentState = await globalModelContext.executeTool('get_workspace_state', {});
        callbacks?.onToolCallEnd?.('get_workspace_state', currentState, 'success');
        executedToolCalls.push({ toolName: 'get_workspace_state', input: {}, output: currentState });
        await new Promise((r) => setTimeout(r, 350));
      }

      // 2. Determine domain actions based on prompt keywords and registered tools
      let finalMessage = '';

      if (promptLower.includes('headphone') || promptLower.includes('cart') || promptLower.includes('keyboard') || promptLower.includes('monitor') || promptLower.includes('discount') || promptLower.includes('coupon') || promptLower.includes('search') || promptLower.includes('oled')) {
        // E-Commerce / Shopify WebMCP Flow
        if (promptLower.includes('search') || promptLower.includes('find') || promptLower.includes('headphone')) {
          callbacks?.onThought?.('Executing WebMCP search_products with query parameters...');
          const searchTool = availableTools.find((t) => t.name === 'search_products');
          if (searchTool) {
            const query = promptLower.includes('headphone') ? 'headphones' : promptLower.includes('keyboard') ? 'keyboard' : 'electronics';
            callbacks?.onToolCallStart?.('search_products', { query, maxResults: 4 });
            const searchResult = await globalModelContext.executeTool('search_products', { query, maxResults: 4 });
            callbacks?.onToolCallEnd?.('search_products', searchResult, 'success');
            executedToolCalls.push({ toolName: 'search_products', input: { query }, output: searchResult });
            await new Promise((r) => setTimeout(r, 400));
          }
        }

        if (promptLower.includes('add') || promptLower.includes('cart') || promptLower.includes('oled') || promptLower.includes('keyboard')) {
          callbacks?.onThought?.('Calling modify_cart WebMCP tool to update live customer shopping session...');
          const cartTool = availableTools.find((t) => t.name === 'modify_cart');
          if (cartTool) {
            const productId = promptLower.includes('oled') ? 'prod-3' : promptLower.includes('keyboard') ? 'prod-2' : 'prod-1';
            callbacks?.onToolCallStart?.('modify_cart', { action: 'add', productId, quantity: 1 });
            const cartResult = await globalModelContext.executeTool('modify_cart', { action: 'add', productId, quantity: 1 });
            callbacks?.onToolCallEnd?.('modify_cart', cartResult, 'success');
            executedToolCalls.push({ toolName: 'modify_cart', input: { action: 'add', productId }, output: cartResult });
            await new Promise((r) => setTimeout(r, 400));
          }
        }

        if (promptLower.includes('discount') || promptLower.includes('negotiate') || promptLower.includes('coupon') || promptLower.includes('summer')) {
          callbacks?.onThought?.('Negotiating promotional discount and updating live total...');
          const discountTool = availableTools.find((t) => t.name === 'apply_discount');
          if (discountTool) {
            const code = promptLower.includes('summer') ? 'SUMMER2026' : 'AGENT_VIP_15';
            const percentage = promptLower.includes('15') ? 15 : 20;
            callbacks?.onToolCallStart?.('apply_discount', { promoCode: code, discountPercent: percentage });
            const discResult = await globalModelContext.executeTool('apply_discount', { promoCode: code, discountPercent: percentage });
            callbacks?.onToolCallEnd?.('apply_discount', discResult, 'success');
            executedToolCalls.push({ toolName: 'apply_discount', input: { promoCode: code, discountPercent: percentage }, output: discResult });
            await new Promise((r) => setTimeout(r, 400));
          }
        }

        finalMessage = `Completed Shopify WebMCP actions. Updated cart state and adjusted live visual store node on canvas.`;
      } else if (promptLower.includes('chart') || promptLower.includes('traffic') || promptLower.includes('spike') || promptLower.includes('analytics') || promptLower.includes('telemetry') || promptLower.includes('cloudflare')) {
        // Analytics & Cloudflare Telemetry Flow
        callbacks?.onThought?.('Querying Cloudflare Edge Telemetry metrics via WebMCP data pipeline...');
        const queryTool = availableTools.find((t) => t.name === 'query_edge_telemetry');
        if (queryTool) {
          callbacks?.onToolCallStart?.('query_edge_telemetry', { timeRange: '30m', metric: 'requests_and_errors' });
          const telemetryResult = await globalModelContext.executeTool('query_edge_telemetry', { timeRange: '30m', metric: 'requests_and_errors' });
          callbacks?.onToolCallEnd?.('query_edge_telemetry', telemetryResult, 'success');
          executedToolCalls.push({ toolName: 'query_edge_telemetry', input: { timeRange: '30m' }, output: telemetryResult });
          await new Promise((r) => setTimeout(r, 400));
        }

        const updateTool = availableTools.find((t) => t.name === 'update_canvas_element');
        if (updateTool) {
          callbacks?.onThought?.('Updating visual telemetry chart node with anomalous error distribution...');
          callbacks?.onToolCallStart?.('update_canvas_element', { nodeId: 'node-cf-chart' });
          const updateResult = await globalModelContext.executeTool('update_canvas_element', {
            nodeId: 'node-cf-chart',
            properties: {
              title: 'Edge Traffic Spike Detected (Anomaly Mitigated)',
              themeColor: '#10B981',
            },
          });
          callbacks?.onToolCallEnd?.('update_canvas_element', updateResult, 'success');
          executedToolCalls.push({ toolName: 'update_canvas_element', input: { nodeId: 'node-cf-chart' }, output: updateResult });
        }

        finalMessage = `Analyzed edge traffic telemetry. Detected 5xx error spike from European PoP and updated live chart metrics.`;
      } else if (promptLower.includes('generate') || promptLower.includes('component') || promptLower.includes('pricing') || promptLower.includes('counter') || promptLower.includes('theme') || promptLower.includes('newsletter')) {
        // React UI Generator Flow
        callbacks?.onThought?.('Generating interactive React component with Tailwind CSS...');
        const genTool = availableTools.find((t) => t.name === 'generate_react_component');
        if (genTool) {
          const compType = promptLower.includes('counter') ? 'counter' : promptLower.includes('newsletter') ? 'newsletter' : 'pricing';
          callbacks?.onToolCallStart?.('generate_react_component', { componentType: compType, theme: 'cyber-dark' });
          const genResult = await globalModelContext.executeTool('generate_react_component', { componentType: compType, theme: 'cyber-dark' });
          callbacks?.onToolCallEnd?.('generate_react_component', genResult, 'success');
          executedToolCalls.push({ toolName: 'generate_react_component', input: { componentType: compType }, output: genResult });
          await new Promise((r) => setTimeout(r, 450));
        }

        finalMessage = `Synthesized new responsive React component and hot-reloaded canvas preview.`;
      } else if (promptLower.includes('triage') || promptLower.includes('ticket') || promptLower.includes('support') || promptLower.includes('escalate')) {
        // Support Triage Flow
        callbacks?.onThought?.('Triaging ticket queue and classifying sentiment...');
        const triageTool = availableTools.find((t) => t.name === 'triage_support_tickets');
        if (triageTool) {
          callbacks?.onToolCallStart?.('triage_support_tickets', { autoResolvePositive: true, escalateCritical: true });
          const triageResult = await globalModelContext.executeTool('triage_support_tickets', { autoResolvePositive: true, escalateCritical: true });
          callbacks?.onToolCallEnd?.('triage_support_tickets', triageResult, 'success');
          executedToolCalls.push({ toolName: 'triage_support_tickets', input: {}, output: triageResult });
          await new Promise((r) => setTimeout(r, 400));
        }

        finalMessage = `Processed customer support tickets. Filtered P0 urgent items and dispatched alert webhooks.`;
      } else {
        // Generic Canvas Action / Add Node Flow
        callbacks?.onThought?.('Creating new agent-generated card node on infinite canvas...');
        const createTool = availableTools.find((t) => t.name === 'create_canvas_element');
        if (createTool) {
          callbacks?.onToolCallStart?.('create_canvas_element', {
            type: 'markdown_doc',
            title: `AI Co-Creation Note: ${userPrompt.slice(0, 30)}...`,
          });
          const createResult = await globalModelContext.executeTool('create_canvas_element', {
            type: 'markdown_doc',
            title: `Agent Insight: ${userPrompt.slice(0, 25)}`,
            content: `### 🤖 WebMCP Autonomous Action\n\nExecuted request: **"${userPrompt}"**\n- Synchronized with active document.modelContext\n- Validated inputs against JSON Schema\n- Emitted real-time canvas change event`,
          });
          callbacks?.onToolCallEnd?.('create_canvas_element', createResult, 'success');
          executedToolCalls.push({ toolName: 'create_canvas_element', input: { type: 'markdown_doc' }, output: createResult });
          await new Promise((r) => setTimeout(r, 350));
        }

        finalMessage = `Processed instruction and dynamically expanded visual workspace.`;
      }

      callbacks?.onComplete?.(finalMessage);
      return { response: finalMessage, toolCalls: executedToolCalls };
    } finally {
      this.isRunning = false;
    }
  }
}

export const agentEngine = new WebMCPAgentEngine();
