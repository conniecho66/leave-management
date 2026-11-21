import React, { useState } from 'react';
import { Code2, Sparkles, Copy, Check, Bookmark, Loader2, Wrench } from 'lucide-react';
import { ModelName, ThinkingLevelOption, WorkspaceItem } from '../types';

interface CodeForgeProps {
  currentModel: ModelName;
  thinkingLevel: ThinkingLevelOption;
  onSaveToWorkspace: (item: Omit<WorkspaceItem, 'id' | 'createdAt'>) => void;
}

export const CodeForge: React.FC<CodeForgeProps> = ({ currentModel, thinkingLevel, onSaveToWorkspace }) => {
  const [task, setTask] = useState('');
  const [language, setLanguage] = useState('TypeScript / React');
  const [mode, setMode] = useState<'generate' | 'debug' | 'sql'>('generate');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim() || loading) return;

    setLoading(true);
    setOutput('');

    let prompt = '';
    if (mode === 'generate') {
      prompt = `Write clean, production-ready ${language} code for the following requirement: "${task}". Include comments, TypeScript interfaces where applicable, and robust error handling.`;
    } else if (mode === 'debug') {
      prompt = `Debug and fix the following ${language} code/issue: "${task}". Provide the corrected code and explain what was fixed.`;
    } else {
      prompt = `Write optimized SQL queries for: "${task}". Provide PostgreSQL compatible SQL with schema definitions and indexes.`;
    }

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model: currentModel,
          systemInstruction: 'You are an elite principal software engineer and systems architect.',
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
        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <Code2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Code Forge & Architecture</h2>
          <p className="text-xs text-zinc-400">Generate components, debug code, and build optimized SQL schemas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-4">
          <div className="flex rounded-xl bg-zinc-950 p-1 border border-zinc-800">
            <button
              type="button"
              onClick={() => setMode('generate')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                mode === 'generate' ? 'bg-cyan-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Generate
            </button>
            <button
              type="button"
              onClick={() => setMode('debug')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                mode === 'debug' ? 'bg-cyan-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Debug & Fix
            </button>
            <button
              type="button"
              onClick={() => setMode('sql')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                mode === 'sql' ? 'bg-cyan-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              SQL / DB
            </button>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Language / Stack</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="TypeScript / React">TypeScript / React</option>
                <option value="Node.js / Express">Node.js / Express</option>
                <option value="Python / FastAPI">Python / FastAPI</option>
                <option value="SQL / PostgreSQL">SQL / PostgreSQL</option>
                <option value="Tailwind CSS">Tailwind CSS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                {mode === 'generate' ? 'Component / Feature Requirement' : mode === 'debug' ? 'Paste Code & Error' : 'Database Schema Requirement'}
              </label>
              <textarea
                value={task}
                onChange={(e) => setTask(e.target.value)}
                rows={6}
                placeholder={
                  mode === 'generate'
                    ? 'e.g., Create a modern Kanban board component with drag & drop styling...'
                    : mode === 'debug'
                    ? 'Paste your buggy code snippet or error stack here...'
                    : 'e.g., Users, posts, and comments table with foreign keys and indexes...'
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 font-mono focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !task.trim()}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Code...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Forge Code</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output Preview */}
        <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
            <span className="text-sm font-semibold text-zinc-300">Code Output</span>
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
                      title: `Code (${language}): ${task.slice(0, 30)}`,
                      type: 'code',
                      content: output,
                      tags: ['code', language],
                    })
                  }
                  className="flex items-center space-x-1.5 text-xs bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 overflow-y-auto text-zinc-200 text-xs font-mono leading-relaxed whitespace-pre min-h-[400px]">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3 text-zinc-500 font-sans">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                <p className="text-xs">Building code with Gemini architecture reasoning...</p>
              </div>
            ) : output ? (
              output
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-center space-y-2 font-sans">
                <Wrench className="w-10 h-10 stroke-1" />
                <p>Enter your requirements and click Forge Code.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
