import React, { useState } from 'react';
import { FileText, Sparkles, Copy, Check, Bookmark, Loader2 } from 'lucide-react';
import { ModelName, ThinkingLevelOption, WorkspaceItem } from '../types';

interface WriterStudioProps {
  currentModel: ModelName;
  thinkingLevel: ThinkingLevelOption;
  onSaveToWorkspace: (item: Omit<WorkspaceItem, 'id' | 'createdAt'>) => void;
}

export const WriterStudio: React.FC<WriterStudioProps> = ({ currentModel, thinkingLevel, onSaveToWorkspace }) => {
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState('Blog Post');
  const [tone, setTone] = useState('Professional');
  const [length, setLength] = useState('Medium (~500 words)');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || loading) return;

    setLoading(true);
    setOutput('');

    const prompt = `Write a ${contentType} about "${topic}". Tone: ${tone}. Desired length: ${length}. Ensure high quality, engaging hooks, and professional structure.`;

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model: currentModel,
          systemInstruction: 'You are an expert copywriter, author, and content creator.',
          thinkingLevel,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setOutput(`Error: ${data.error}`);
      } else {
        setOutput(data.text);
      }
    } catch (err: any) {
      setOutput(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center space-x-3 pb-4 border-b border-zinc-800">
        <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">AI Writer Studio</h2>
          <p className="text-xs text-zinc-400">Generate professional blog posts, marketing copy, newsletters, and stories</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-4">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Content Type</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
              >
                <option value="Blog Post">Blog Post / Article</option>
                <option value="Marketing Copy">Marketing Landing Page Copy</option>
                <option value="Newsletter">Email Newsletter</option>
                <option value="Story">Fictional Short Story</option>
                <option value="Press Release">Press Release</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Topic / Brief</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={4}
                placeholder="Describe what you want to write about..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
              >
                <option value="Professional">Professional & Authoritative</option>
                <option value="Casual & Friendly">Casual & Friendly</option>
                <option value="Enthusiastic & Energetic">Enthusiastic & Energetic</option>
                <option value="Persuasive & Sales">Persuasive & Sales-driven</option>
                <option value="Witty & Humorous">Witty & Humorous</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Length</label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-violet-500"
              >
                <option value="Short (~250 words)">Short (~250 words)</option>
                <option value="Medium (~500 words)">Medium (~500 words)</option>
                <option value="Long (~1000 words)">Long (~1000 words)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-violet-600/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Crafting Content...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Content</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output Preview */}
        <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
            <span className="text-sm font-semibold text-zinc-300">Generated Output</span>
            {output && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() =>
                    onSaveToWorkspace({
                      title: `${contentType}: ${topic.slice(0, 30)}`,
                      type: 'writer',
                      content: output,
                      tags: ['writer', contentType],
                    })
                  }
                  className="flex items-center space-x-1.5 text-xs bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 overflow-y-auto text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap font-sans min-h-[400px]">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3 text-zinc-500">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                <p className="text-xs">Generating your {contentType.toLowerCase()} with Gemini...</p>
              </div>
            ) : output ? (
              output
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-center space-y-2">
                <FileText className="w-10 h-10 stroke-1" />
                <p>Fill out the topic and click Generate Content to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
