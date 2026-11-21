import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, Copy, Check, Bookmark, Loader2, Trash2 } from 'lucide-react';
import { ChatMessage, ModelName, ThinkingLevelOption, WorkspaceItem } from '../types';

interface ChatLabProps {
  currentModel: ModelName;
  thinkingLevel: ThinkingLevelOption;
  onSaveToWorkspace: (item: Omit<WorkspaceItem, 'id' | 'createdAt'>) => void;
}

export const ChatLab: React.FC<ChatLabProps> = ({ currentModel, thinkingLevel, onSaveToWorkspace }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am NexusAI Studio, powered by Google Gemini. How can I help you brainstorm, analyze, or build today?',
      timestamp: Date.now(),
      model: currentModel,
    },
  ]);
  const [input, setInput] = useState('');
  const [systemInstruction, setSystemInstruction] = useState('You are a brilliant, expert AI assistant.');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const assistantMsgId = (Date.now() + 1).toString();
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      model: currentModel,
    };
    setMessages((prev) => [...prev, initialAssistantMsg]);

    try {
      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMsg.content,
          model: currentModel,
          systemInstruction,
          thinkingLevel,
        }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulated += parsed.text;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId ? { ...msg, content: accumulated } : msg
                  )
                );
              }
              if (parsed.error) {
                accumulated += `\n[Error: ${parsed.error}]`;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId ? { ...msg, content: accumulated } : msg
                  )
                );
              }
            } catch (e) {
              // ignore json parse error on incomplete chunks
            }
          }
        }
      }
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, content: `Error connecting to AI server: ${err.message}` }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden">
      {/* Top Banner */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">AI Chat & Reasoning Lab</h2>
            <p className="text-xs text-zinc-400">Interactive conversational reasoning with Gemini 4</p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors"
        >
          {showSettings ? 'Hide System Prompt' : 'Configure System Prompt'}
        </button>
      </div>

      {/* System prompt box */}
      {showSettings && (
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/80">
          <label className="block text-xs font-medium text-zinc-300 mb-1">
            System Instructions (Persona / Role / Rules)
          </label>
          <textarea
            value={systemInstruction}
            onChange={(e) => setSystemInstruction(e.target.value)}
            rows={2}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="Define how the AI should behave..."
          />
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                  isUser
                    ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white'
                    : 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-3xl rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between mb-2 pb-1 border-b border-zinc-800/40 text-[11px] text-zinc-400">
                  <span className="font-semibold">{isUser ? 'You' : `Gemini (${msg.model || currentModel})`}</span>
                  <div className="flex items-center space-x-2">
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {!isUser && (
                      <>
                        <button
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="hover:text-white transition-colors p-1"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() =>
                            onSaveToWorkspace({
                              title: msg.content.slice(0, 40) + '...',
                              type: 'chat',
                              content: msg.content,
                              tags: ['chat', currentModel],
                            })
                          }
                          className="hover:text-white transition-colors p-1"
                          title="Save to Workspace"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 backdrop-blur-md">
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything, request code, analysis, or ideas..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
