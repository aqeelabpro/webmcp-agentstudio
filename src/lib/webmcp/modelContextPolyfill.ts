import {
  WebMCPModelContext,
  WebMCPToolDefinition,
  WebMCPToolInvocationLog,
  WebMCPExecutionContext,
} from '../../types/webmcp';

class WebMCPContextImpl implements WebMCPModelContext {
  private tools: Map<string, WebMCPToolDefinition> = new Map();
  private eventTarget = new EventTarget();
  private logs: WebMCPToolInvocationLog[] = [];
  private confirmationHandler?: (
    tool: WebMCPToolDefinition,
    input: Record<string, unknown>
  ) => Promise<boolean>;

  constructor() {
    if (typeof window !== 'undefined') {
      window.__WEBMCP_LOGS__ = this.logs;
      window.__WEBMCP_DEBUG__ = true;
    }
  }

  public setConfirmationHandler(
    handler: (tool: WebMCPToolDefinition, input: Record<string, unknown>) => Promise<boolean>
  ) {
    this.confirmationHandler = handler;
  }

  public registerTool<TInput = Record<string, unknown>, TOutput = unknown>(
    tool: WebMCPToolDefinition<TInput, TOutput>
  ): () => void {
    if (!tool.name) {
      throw new Error('WebMCP: Tool must have a unique name.');
    }
    if (!tool.description) {
      throw new Error(`WebMCP: Tool '${tool.name}' must have a description.`);
    }

    this.tools.set(tool.name, tool as unknown as WebMCPToolDefinition);

    // Dispatch WebMCP event
    this.eventTarget.dispatchEvent(
      new CustomEvent('toolRegistered', { detail: { tool } })
    );

    // If native document.modelContext exists and is not this polyfill, register there too
    const nativeCtx = (window as unknown as { __nativeModelContext?: WebMCPModelContext }).__nativeModelContext;
    if (nativeCtx && typeof nativeCtx.registerTool === 'function') {
      try {
        nativeCtx.registerTool(tool as unknown as WebMCPToolDefinition);
      } catch (err) {
        console.warn('Failed to register tool on native modelContext:', err);
      }
    }

    // Return unregister cleanup function
    return () => this.unregisterTool(tool.name);
  }

  public unregisterTool(toolName: string): void {
    const existing = this.tools.get(toolName);
    if (existing) {
      this.tools.delete(toolName);
      this.eventTarget.dispatchEvent(
        new CustomEvent('toolUnregistered', { detail: { toolName } })
      );
    }
  }

  public getRegisteredTools(): WebMCPToolDefinition[] {
    return Array.from(this.tools.values());
  }

  public getTool(toolName: string): WebMCPToolDefinition | undefined {
    return this.tools.get(toolName);
  }

  public async executeTool<TInput = Record<string, unknown>, TOutput = unknown>(
    toolName: string,
    input: TInput,
    context?: Partial<WebMCPExecutionContext>
  ): Promise<TOutput> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      const errorMsg = `WebMCP: Tool '${toolName}' not found. Available tools: ${Array.from(this.tools.keys()).join(', ')}`;
      this.recordLog({
        id: `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        toolName,
        input: input as unknown as Record<string, unknown>,
        error: errorMsg,
        status: 'error',
        timestamp: Date.now(),
      });
      throw new Error(errorMsg);
    }

    const logId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const startTime = performance.now();

    // Human-in-the-loop safety check if tool requires confirmation
    if (tool.requiresConfirmation && this.confirmationHandler) {
      const confirmed = await this.confirmationHandler(
        tool,
        input as unknown as Record<string, unknown>
      );
      if (!confirmed) {
        const rejectMsg = `User rejected confirmation for tool execution: ${toolName}`;
        this.recordLog({
          id: logId,
          toolName,
          input: input as unknown as Record<string, unknown>,
          error: rejectMsg,
          status: 'rejected',
          timestamp: Date.now(),
        });
        throw new Error(rejectMsg);
      }
    }

    const execContext: WebMCPExecutionContext = {
      caller: context?.caller || 'WebMCP-Agent',
      timestamp: Date.now(),
      sessionId: context?.sessionId || 'session_default',
      signal: context?.signal,
    };

    try {
      const result = await tool.execute(input as Record<string, unknown>, execContext);
      const durationMs = Math.round(performance.now() - startTime);

      this.recordLog({
        id: logId,
        toolName,
        input: input as unknown as Record<string, unknown>,
        output: result,
        status: 'success',
        durationMs,
        timestamp: Date.now(),
      });

      this.eventTarget.dispatchEvent(
        new CustomEvent('toolExecuted', {
          detail: { logId, toolName, input, output: result, durationMs },
        })
      );

      return result as TOutput;
    } catch (err: unknown) {
      const durationMs = Math.round(performance.now() - startTime);
      const errMsg = err instanceof Error ? err.message : String(err);

      this.recordLog({
        id: logId,
        toolName,
        input: input as unknown as Record<string, unknown>,
        error: errMsg,
        status: 'error',
        durationMs,
        timestamp: Date.now(),
      });

      this.eventTarget.dispatchEvent(
        new CustomEvent('toolExecuted', {
          detail: { logId, toolName, input, error: errMsg, durationMs },
        })
      );

      throw err;
    }
  }

  public addEventListener(
    event: 'toolRegistered' | 'toolUnregistered' | 'toolExecuted',
    listener: (event: CustomEvent) => void
  ): void {
    this.eventTarget.addEventListener(event, listener as EventListener);
  }

  public removeEventListener(
    event: string,
    listener: (event: CustomEvent) => void
  ): void {
    this.eventTarget.removeEventListener(event, listener as EventListener);
  }

  public getLogs(): WebMCPToolInvocationLog[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs.length = 0;
  }

  private recordLog(log: WebMCPToolInvocationLog): void {
    this.logs.unshift(log);
    if (this.logs.length > 200) {
      this.logs.pop();
    }
  }
}

// Global Singleton Instance
export const globalModelContext = new WebMCPContextImpl();

/**
 * Initializes and binds document.modelContext and navigator.modelContext
 * Complies with Chrome 149+ WebMCP testing flag & ChatGPT in-app browser
 */
export function initWebMCPPolyfill(): WebMCPModelContext {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return globalModelContext;
  }

  // Preserve native modelContext reference if injected by browser
  if (document.modelContext && document.modelContext !== (globalModelContext as unknown)) {
    (window as unknown as { __nativeModelContext?: WebMCPModelContext }).__nativeModelContext = document.modelContext;
  }

  // Set standard WebMCP globals
  try {
    Object.defineProperty(document, 'modelContext', {
      value: globalModelContext,
      writable: true,
      configurable: true,
    });
  } catch {
    document.modelContext = globalModelContext;
  }

  try {
    Object.defineProperty(navigator, 'modelContext', {
      value: globalModelContext,
      writable: true,
      configurable: true,
    });
  } catch {
    (navigator as unknown as { modelContext: WebMCPModelContext }).modelContext = globalModelContext;
  }

  return globalModelContext;
}
