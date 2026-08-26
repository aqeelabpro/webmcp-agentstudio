/**
 * WebMCP Specification TypeScript Definitions
 * Aligned with W3C / WebML / OpenAI WebMCP standard (chrome://flags/#enable-webmcp-testing)
 */

export interface WebMCPToolParameterProperty {
  type: string;
  description?: string;
  enum?: string[];
  items?: WebMCPToolParameterProperty;
  properties?: Record<string, WebMCPToolParameterProperty>;
  required?: string[];
  default?: unknown;
}

export interface WebMCPToolInputSchema {
  type: 'object';
  properties: Record<string, WebMCPToolParameterProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface WebMCPToolDefinition<TInput = Record<string, unknown>, TOutput = unknown> {
  name: string;
  description: string;
  inputSchema: WebMCPToolInputSchema;
  execute: (input: TInput, context?: WebMCPExecutionContext) => Promise<TOutput> | TOutput;
  category?: 'canvas' | 'data' | 'ui' | 'system' | 'commerce' | 'workflow';
  requiresConfirmation?: boolean;
  confirmationMessage?: (input: TInput) => string;
}

export interface WebMCPExecutionContext {
  caller?: string;
  timestamp: number;
  sessionId?: string;
  signal?: AbortSignal;
}

export interface WebMCPToolInvocationLog {
  id: string;
  toolName: string;
  input: Record<string, unknown>;
  output?: unknown;
  error?: string;
  status: 'pending' | 'success' | 'error' | 'awaiting_confirmation' | 'rejected';
  durationMs?: number;
  timestamp: number;
}

export interface WebMCPModelContext {
  registerTool: <TInput = Record<string, unknown>, TOutput = unknown>(
    tool: WebMCPToolDefinition<TInput, TOutput>
  ) => () => void;
  unregisterTool: (toolName: string) => void;
  getRegisteredTools: () => WebMCPToolDefinition[];
  getTool: (toolName: string) => WebMCPToolDefinition | undefined;
  executeTool: <TInput = Record<string, unknown>, TOutput = unknown>(
    toolName: string,
    input: TInput
  ) => Promise<TOutput>;
  addEventListener: (event: 'toolRegistered' | 'toolUnregistered' | 'toolExecuted', listener: (event: CustomEvent) => void) => void;
  removeEventListener: (event: string, listener: (event: CustomEvent) => void) => void;
}

// Augment Global Window / Document definitions
declare global {
  interface Document {
    modelContext?: WebMCPModelContext;
  }
  interface Navigator {
    modelContext?: WebMCPModelContext;
  }
  interface Window {
    __WEBMCP_DEBUG__?: boolean;
    __WEBMCP_LOGS__?: WebMCPToolInvocationLog[];
  }
}
