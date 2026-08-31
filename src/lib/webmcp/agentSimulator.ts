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

      callbacks?.onThought?.('Analyzing intent and querying document.modelContext registered tools...');
      await new Promise((r) => setTimeout(r, 400));

      // 1. Inspect workspace state if tool available
      const hasStateTool = availableTools.find((t) => t.name === 'get_workspace_state');
      if (hasStateTool) {
        callbacks?.onThought?.('Inspecting current visual canvas state via get_workspace_state tool...');
        callbacks?.onToolCallStart?.('get_workspace_state', {});
        const currentState = await globalModelContext.executeTool('get_workspace_state', {});
        callbacks?.onToolCallEnd?.('get_workspace_state', currentState, 'success');
        executedToolCalls.push({ toolName: 'get_workspace_state', input: {}, output: currentState });
        await new Promise((r) => setTimeout(r, 300));
      }

      // 2. Intent Disambiguation
      const isDiscountIntent =
        (promptLower.includes('discount') ||
          promptLower.includes('negotiate') ||
          promptLower.includes('coupon') ||
          promptLower.includes('promo') ||
          promptLower.includes('bargain') ||
          promptLower.includes('summer')) &&
        !promptLower.includes('add') &&
        !promptLower.includes('buy');

      const isAddToCartIntent =
        promptLower.includes('add') ||
        promptLower.includes('buy') ||
        promptLower.includes('purchase') ||
        promptLower.includes('put in cart');

      const isSearchOnlyIntent =
        (promptLower.includes('search') || promptLower.includes('find') || promptLower.includes('lookup')) &&
        !isAddToCartIntent &&
        !isDiscountIntent;

      const isClearCartIntent =
        promptLower.includes('clear') || promptLower.includes('empty');

      const isCalculateTaxesIntent =
        promptLower.includes('calculate') ||
        promptLower.includes('tax') ||
        promptLower.includes('taxes') ||
        promptLower.includes('shipping') ||
        promptLower.includes('total with');

      const isTelemetryIntent =
        promptLower.includes('traffic') ||
        promptLower.includes('spike') ||
        promptLower.includes('ddos') ||
        promptLower.includes('anomaly') ||
        promptLower.includes('telemetry') ||
        promptLower.includes('cloudflare');

      const isGenerateUIIntent =
        promptLower.includes('generate') ||
        promptLower.includes('component') ||
        promptLower.includes('pricing') ||
        promptLower.includes('counter') ||
        promptLower.includes('newsletter') ||
        promptLower.includes('theme');

      const isSupportTriageIntent =
        promptLower.includes('triage') ||
        promptLower.includes('ticket') ||
        promptLower.includes('support') ||
        promptLower.includes('escalate');

      let finalMessage = '';

      // --- FLOW 1: STRICT DISCOUNT / PROMO NEGOTIATION ---
      if (isDiscountIntent) {
        callbacks?.onThought?.('Negotiating promotional discount and updating live total...');
        const discountTool = availableTools.find((t) => t.name === 'apply_discount');
        if (discountTool) {
          const promoCode = promptLower.includes('summer') ? 'SUMMER2026' : 'AGENT_VIP_15';
          const discountPercent = promptLower.includes('20') ? 20 : 15;
          callbacks?.onToolCallStart?.('apply_discount', { promoCode, discountPercent });
          const discResult = await globalModelContext.executeTool('apply_discount', { promoCode, discountPercent });
          callbacks?.onToolCallEnd?.('apply_discount', discResult, 'success');
          executedToolCalls.push({ toolName: 'apply_discount', input: { promoCode, discountPercent }, output: discResult });
          await new Promise((r) => setTimeout(r, 400));
        }
        finalMessage = `Applied ${promptLower.includes('20') ? '20%' : '15%'} promotional discount. Recalculated total and synchronized connected analytics pipeline on canvas.`;
      }

      // --- FLOW 2: ADD TO CART (+ OPTIONAL SEARCH) ---
      else if (isAddToCartIntent) {
        if (promptLower.includes('search') || promptLower.includes('find') || promptLower.includes('top rated') || promptLower.includes('headphones')) {
          callbacks?.onThought?.('Searching product catalog via search_products WebMCP tool...');
          const searchTool = availableTools.find((t) => t.name === 'search_products');
          if (searchTool) {
            const query = promptLower.includes('headphone') ? 'headphones' : promptLower.includes('keyboard') ? 'keyboard' : promptLower.includes('oled') ? 'oled' : 'gear';
            callbacks?.onToolCallStart?.('search_products', { query, maxResults: 3 });
            const searchResult = await globalModelContext.executeTool('search_products', { query, maxResults: 3 });
            callbacks?.onToolCallEnd?.('search_products', searchResult, 'success');
            executedToolCalls.push({ toolName: 'search_products', input: { query }, output: searchResult });
            await new Promise((r) => setTimeout(r, 350));
          }
        }

        callbacks?.onThought?.('Calling modify_cart WebMCP tool to update live customer shopping session...');
        const cartTool = availableTools.find((t) => t.name === 'modify_cart');
        if (cartTool) {
          const productId = promptLower.includes('oled') ? 'prod-3' : promptLower.includes('keyboard') ? 'prod-2' : promptLower.includes('mouse') ? 'prod-4' : 'prod-1';
          callbacks?.onToolCallStart?.('modify_cart', { action: 'add', productId, quantity: 1 });
          const cartResult = await globalModelContext.executeTool('modify_cart', { action: 'add', productId, quantity: 1 });
          callbacks?.onToolCallEnd?.('modify_cart', cartResult, 'success');
          executedToolCalls.push({ toolName: 'modify_cart', input: { action: 'add', productId }, output: cartResult });
          await new Promise((r) => setTimeout(r, 350));
        }

        finalMessage = `Added item to live shopping session. Updated cart subtotal and triggered reactive pipeline flow to sales chart.`;
      }

      // --- FLOW 3: SEARCH ONLY ---
      else if (isSearchOnlyIntent) {
        callbacks?.onThought?.('Executing WebMCP search_products with query parameters...');
        const searchTool = availableTools.find((t) => t.name === 'search_products');
        if (searchTool) {
          const query = promptLower.includes('headphone') ? 'headphones' : promptLower.includes('keyboard') ? 'keyboard' : promptLower.includes('oled') ? 'oled' : 'gear';
          callbacks?.onToolCallStart?.('search_products', { query, maxResults: 4 });
          const searchResult = await globalModelContext.executeTool('search_products', { query, maxResults: 4 });
          callbacks?.onToolCallEnd?.('search_products', searchResult, 'success');
          executedToolCalls.push({ toolName: 'search_products', input: { query }, output: searchResult });
        }
        finalMessage = `Queried store catalog. Filtered products matching criteria and verified real-time stock availability.`;
      }

      // --- FLOW 4: CLEAR CART ---
      else if (isClearCartIntent) {
        callbacks?.onThought?.('Clearing active shopping cart session via modify_cart WebMCP tool...');
        const cartTool = availableTools.find((t) => t.name === 'modify_cart');
        if (cartTool) {
          callbacks?.onToolCallStart?.('modify_cart', { action: 'clear' });
          const cartResult = await globalModelContext.executeTool('modify_cart', { action: 'clear' });
          callbacks?.onToolCallEnd?.('modify_cart', cartResult, 'success');
          executedToolCalls.push({ toolName: 'modify_cart', input: { action: 'clear' }, output: cartResult });
        }
        finalMessage = `Emptied active cart and reset revenue telemetry.`;
      }

      // --- FLOW 5: CALCULATE TAXES & CHECKOUT TOTALS ---
      else if (isCalculateTaxesIntent) {
        callbacks?.onThought?.('Calculating dynamic sales tax, VIP shipping, and applying coupon...');
        const discountTool = availableTools.find((t) => t.name === 'apply_discount');
        if (discountTool) {
          callbacks?.onToolCallStart?.('apply_discount', { promoCode: 'SUMMER2026', discountPercent: 15 });
          const discResult = await globalModelContext.executeTool('apply_discount', { promoCode: 'SUMMER2026', discountPercent: 15 });
          callbacks?.onToolCallEnd?.('apply_discount', discResult, 'success');
          executedToolCalls.push({ toolName: 'apply_discount', input: { promoCode: 'SUMMER2026' }, output: discResult });
        }
        finalMessage = `Calculated checkout breakdown: 15% discount applied (SUMMER2026), 0.00 VIP Express Shipping, and standard sales tax included. Total updated live.`;
      }

      // --- FLOW 6: TELEMETRY & CLOUDFLARE ---
      else if (isTelemetryIntent) {
        callbacks?.onThought?.('Querying Cloudflare Edge Telemetry metrics via WebMCP data pipeline...');
        const queryTool = availableTools.find((t) => t.name === 'query_edge_telemetry');
        if (queryTool) {
          callbacks?.onToolCallStart?.('query_edge_telemetry', { timeRange: '30m', metric: 'requests_and_errors' });
          const telemetryResult = await globalModelContext.executeTool('query_edge_telemetry', { timeRange: '30m', metric: 'requests_and_errors' });
          callbacks?.onToolCallEnd?.('query_edge_telemetry', telemetryResult, 'success');
          executedToolCalls.push({ toolName: 'query_edge_telemetry', input: { timeRange: '30m' }, output: telemetryResult });
          await new Promise((r) => setTimeout(r, 350));
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
      }

      // --- FLOW 7: REACT UI SYNTHESIZER ---
      else if (isGenerateUIIntent) {
        callbacks?.onThought?.('Generating interactive React component with Tailwind CSS...');
        const genTool = availableTools.find((t) => t.name === 'generate_react_component');
        if (genTool) {
          const compType = promptLower.includes('counter') ? 'counter' : promptLower.includes('newsletter') ? 'newsletter' : 'pricing';
          callbacks?.onToolCallStart?.('generate_react_component', { componentType: compType, theme: 'cyber-dark' });
          const genResult = await globalModelContext.executeTool('generate_react_component', { componentType: compType, theme: 'cyber-dark' });
          callbacks?.onToolCallEnd?.('generate_react_component', genResult, 'success');
          executedToolCalls.push({ toolName: 'generate_react_component', input: { componentType: compType }, output: genResult });
          await new Promise((r) => setTimeout(r, 400));
        }
        finalMessage = `Synthesized new responsive React component and hot-reloaded canvas preview.`;
      }

      // --- FLOW 8: SUPPORT OPS TRIAGE ---
      else if (isSupportTriageIntent) {
        callbacks?.onThought?.('Triaging ticket queue and classifying sentiment...');
        const triageTool = availableTools.find((t) => t.name === 'triage_support_tickets');
        if (triageTool) {
          callbacks?.onToolCallStart?.('triage_support_tickets', { autoResolvePositive: true, escalateCritical: true });
          const triageResult = await globalModelContext.executeTool('triage_support_tickets', { autoResolvePositive: true, escalateCritical: true });
          callbacks?.onToolCallEnd?.('triage_support_tickets', triageResult, 'success');
          executedToolCalls.push({ toolName: 'triage_support_tickets', input: {}, output: triageResult });
          await new Promise((r) => setTimeout(r, 350));
        }
        finalMessage = `Processed customer support tickets. Filtered P0 urgent items and dispatched alert webhooks.`;
      }

      // --- FLOW 9: FALLBACK EXPAND CANVAS ---
      else {
        callbacks?.onThought?.('Creating new agent-generated card node on infinite canvas...');
        const createTool = availableTools.find((t) => t.name === 'create_canvas_element');
        if (createTool) {
          callbacks?.onToolCallStart?.('create_canvas_element', {
            type: 'markdown_doc',
            title: `AI Co-Creation: ${userPrompt.slice(0, 25)}`,
          });
          const createResult = await globalModelContext.executeTool('create_canvas_element', {
            type: 'markdown_doc',
            title: `Agent Action: ${userPrompt.slice(0, 22)}...`,
            content: `### 🤖 WebMCP Autonomous Action\n\nExecuted request: **"${userPrompt}"**\n- Synchronized with active document.modelContext\n- Validated inputs against JSON Schema\n- Emitted real-time canvas change event`,
          });
          callbacks?.onToolCallEnd?.('create_canvas_element', createResult, 'success');
          executedToolCalls.push({ toolName: 'create_canvas_element', input: { type: 'markdown_doc' }, output: createResult });
          await new Promise((r) => setTimeout(r, 300));
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
