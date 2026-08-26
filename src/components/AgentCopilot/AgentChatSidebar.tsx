import React, { useState, useRef, useEffect } from 'react';
import { AgentChatMessage, agentEngine } from '../../lib/webmcp/agentSimulator';
import {
  Bot,
  Send,
  Sparkles,
  ChevronRight,
  Wrench,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  suggestedPrompts?: string[];
  activePresetTitle: string;
}

export const AgentChatSidebar: React.FC<Props> = ({
  isOpen,
  onToggle,
  suggestedPrompts = [],
  activePresetTitle,
}) => {
  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'agent',
      text: `Hello! I am your **WebMCP Autonomous Co-Pilot**. I am directly bound to \`document.modelContext\` tools on this canvas. Try picking a prompt below or give me any command!`,
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [currentThought, setCurrentThought] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, currentThought]);

  const handleSendPrompt = async (promptToSend?: string) => {
    const text = (promptToSend || inputText).trim();
    if (!text || isThinking) return;

    const userMessage: AgentChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!promptToSend) setInputText('');
    setIsThinking(true);
    setCurrentThought('Analyzing intent and querying document.modelContext...');

    try {
      const result = await agentEngine.runAgentTask(text, {
        onThought: (thought) => setCurrentThought(thought),
      });

      const agentMessage: AgentChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: result.response,
        toolInvocations: result.toolCalls.map((tc) => ({
          toolName: tc.toolName,
          input: tc.input,
          output: tc.output,
          status: 'success',
        })),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (err: unknown) {
      const errorMessage: AgentChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'system',
        text: `Error executing WebMCP command: ${err instanceof Error ? err.message : String(err)}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
      setCurrentThought(null);
    }
  };

  return (
    <div
      className={`fixed top-14 bottom-0 right-0 z-40 flex transition-all duration-300 ${
        isOpen ? 'w-[400px]' : 'w-0'
      }`}
    >
      {/* Toggle Tab Button */}
      <button
        onClick={onToggle}
        className="absolute -left-9 top-6 p-2 rounded-l-xl bg-slate-900 border-y border-l border-slate-800 text-cyan-400 hover:text-white shadow-xl flex items-center justify-center transition-colors"
        title={isOpen ? 'Collapse Sidebar' : 'Open Co-Pilot'}
      >
        {isOpen ? <ChevronRight className="w-4 h-4" /> : <Bot className="w-5 h-5 animate-pulse" />}
      </button>

      {/* Main Sidebar Panel */}
      <div className="w-full h-full bg-[#0b0f19] border-l border-slate-800 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-800/90 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                WebMCP Co-Pilot
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </h3>
              <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                {activePresetTitle}
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            document.modelContext
          </span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 min-h-0 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[90%] p-3 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-cyan-600 text-white rounded-br-none shadow-md'
                    : msg.sender === 'system'
                    ? 'bg-rose-950/80 border border-rose-800 text-rose-200 rounded-bl-none'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none shadow-lg'
                }`}
              >
                {/* Text Content */}
                <div className="space-y-1.5 whitespace-pre-wrap leading-relaxed">
                  {msg.text}
                </div>

                {/* Tool Invocations inside message */}
                {msg.toolInvocations && msg.toolInvocations.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1.5 font-mono text-[10px]">
                    <div className="text-slate-400 flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-cyan-400" />
                      Executed WebMCP Tools ({msg.toolInvocations.length}):
                    </div>
                    {msg.toolInvocations.map((tc, idx) => (
                      <div
                        key={idx}
                        className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-cyan-300 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                          <span className="font-bold truncate">{tc.toolName}</span>
                        </div>
                        <span className="text-[9px] text-emerald-400 font-sans">Synced</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[9px] text-slate-600 px-1 mt-1 font-mono">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          ))}

          {/* Thinking / Running Indicator */}
          {isThinking && (
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-cyan-500/40 text-slate-200 rounded-bl-none space-y-2 animate-pulse max-w-[90%]">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>WebMCP Agent Brain Thinking...</span>
              </div>
              {currentThought && (
                <p className="text-[11px] text-slate-300 font-mono italic">
                  {currentThought}
                </p>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        {suggestedPrompts.length > 0 && (
          <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40">
            <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Suggested Actions:
            </div>
            <div className="flex flex-col gap-1 max-h-24 overflow-y-auto">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendPrompt(prompt)}
                  disabled={isThinking}
                  className="text-left px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800/80 text-[11px] text-slate-300 hover:text-cyan-300 transition-all truncate disabled:opacity-50"
                >
                  ⚡ {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask agent or trigger WebMCP tool..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isThinking}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isThinking}
              className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
