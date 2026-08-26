import { useEffect, useState, useCallback } from 'react';
import { globalModelContext } from './modelContextPolyfill';
import {
  WebMCPToolDefinition,
  WebMCPToolInvocationLog,
  WebMCPModelContext,
} from '../../types/webmcp';

/**
 * useWebMCPTool: Standard React hook to register WebMCP tools from React components.
 * Automatically unregisters tool upon component unmount.
 */
export function useWebMCPTool<TInput = Record<string, unknown>, TOutput = unknown>(
  tool: WebMCPToolDefinition<TInput, TOutput> | null,
  deps: unknown[] = []
): void {
  useEffect(() => {
    if (!tool) return;

    const unregister = globalModelContext.registerTool(tool);
    return () => {
      unregister();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool?.name, tool?.description, JSON.stringify(tool?.inputSchema), ...deps]);
}

/**
 * useWebMCPRegistry: Hook to observe all registered WebMCP tools & logs in real-time.
 */
export function useWebMCPRegistry(): {
  tools: WebMCPToolDefinition[];
  logs: WebMCPToolInvocationLog[];
  executeTool: WebMCPModelContext['executeTool'];
  clearLogs: () => void;
  nativeSupport: boolean;
} {
  const [tools, setTools] = useState<WebMCPToolDefinition[]>(() =>
    globalModelContext.getRegisteredTools()
  );
  const [logs, setLogs] = useState<WebMCPToolInvocationLog[]>(() =>
    globalModelContext.getLogs()
  );
  const [nativeSupport, setNativeSupport] = useState<boolean>(false);

  useEffect(() => {
    // Check if native Chrome 149 / ChatGPT in-app browser has modelContext
    const hasNative =
      typeof window !== 'undefined' &&
      !!(window as unknown as { __nativeModelContext?: unknown }).__nativeModelContext;
    setNativeSupport(hasNative);

    const updateTools = () => {
      setTools(globalModelContext.getRegisteredTools());
    };

    const updateLogs = () => {
      setLogs(globalModelContext.getLogs());
    };

    globalModelContext.addEventListener('toolRegistered', updateTools);
    globalModelContext.addEventListener('toolUnregistered', updateTools);
    globalModelContext.addEventListener('toolExecuted', updateLogs);

    return () => {
      globalModelContext.removeEventListener('toolRegistered', updateTools);
      globalModelContext.removeEventListener('toolUnregistered', updateTools);
      globalModelContext.removeEventListener('toolExecuted', updateLogs);
    };
  }, []);

  const executeTool = useCallback(
    <TInput = Record<string, unknown>, TOutput = unknown>(
      toolName: string,
      input: TInput
    ) => {
      return globalModelContext.executeTool<TInput, TOutput>(toolName, input);
    },
    []
  );

  const clearLogs = useCallback(() => {
    globalModelContext.clearLogs();
    setLogs([]);
  }, []);

  return {
    tools,
    logs,
    executeTool,
    clearLogs,
    nativeSupport,
  };
}
