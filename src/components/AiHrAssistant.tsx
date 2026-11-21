import React, { useState } from 'react';
import { Bot, Sparkles, Send, User, Loader2 } from 'lucide-react';
import { ModelName, ThinkingLevelOption } from '../types';

interface AiHrAssistantProps {
  currentModel: ModelName;
  thinkingLevel: ThinkingLevelOption;
}

export const AiHrAssistant: React.FC<AiHrAssistantProps> = ({ currentModel, thinkingLevel }) => {
  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; content: string }>>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am your AI HR & Leave Policy Assistant. Ask me anything about company leave policies, carry-over rules, parental leave, or request handover assistance.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { id: Date.now().toString(), role: 'user' as const, content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const assistantMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMsg.content,
          model: currentModel,
          systemInstruction: 'You are an expert HR assistant and company leave policy guide.',
          thinkingLevel,
        }),
      });

      if (!res.body) throw new Error('No stream body');
      const reader = res.body.getReader();
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
                  prev.map((m) => (m.id === assistantMsgId ? { ...m, content: accumulated } : m))
                );
              }
            } catch {}
          }
        }
      }
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantMsgId ? { ...m, content: `Error: ${err.message}` } : m))
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center space-x-3">
        <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">AI HR & Policy Assistant</h2>
          <p className="text-xs text-zinc-400">Ask questions about leave policies, entitlements, and handover plans</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div key={m.id} className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-emerald-400 border border-zinc-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>
              <div
                className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-zinc-800 bg-zinc-900/60">
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about annual leave quota, sick leave rules, or handover guidelines..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
