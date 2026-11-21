import React, { useState } from 'react';
import { Database, Sparkles, Copy, Check, Bookmark, Loader2, Braces } from 'lucide-react';
import { ModelName, ThinkingLevelOption, WorkspaceItem } from '../types';

interface JsonExtractorProps {
  currentModel: ModelName;
  thinkingLevel: ThinkingLevelOption;
  onSaveToWorkspace: (item: Omit<WorkspaceItem, 'id' | 'createdAt'>) => void;
}

export const JsonExtractor: React.FC<JsonExtractorProps> = ({ currentModel, thinkingLevel, onSaveToWorkspace }) => {
  const [textInput, setTextInput] = useState(
    'Apple Inc. reported Q4 revenue of $94.9 billion, up 6% year-over-year, driven by strong iPhone sales and services growth. CEO Tim Cook highlighted record active devices.'
  );
  const [schemaType, setSchemaType] = useState('Financial Report');
  const [outputJson, setOutputJson] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || loading) return;

    setLoading(true);
    setOutputJson('');

    let prompt = `Extract structured data from the following text into JSON based on schema type "${schemaType}":\n\n${textInput}`;

    // Define response schema based on selection
    let responseSchema: any = {};
    if (schemaType === 'Financial Report') {
      responseSchema = {
        type: 'OBJECT',
        properties: {
          companyName: { type: 'STRING', description: 'Name of the company' },
          quarter: { type: 'STRING', description: 'Reporting quarter' },
          revenue: { type: 'STRING', description: 'Revenue figure reported' },
          growthRate: { type: 'STRING', description: 'Year-over-year growth rate' },
          keyHighlights: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            description: 'Key highlights or growth drivers',
          },
        },
      };
    } else {
      responseSchema = {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          category: { type: 'STRING' },
          summary: { type: 'STRING' },
          entities: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            description: 'Key entities mentioned',
          },
        },
      };
    }

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model: currentModel,
          systemInstruction: 'You are a precise data extraction and JSON structuring assistant.',
          thinkingLevel,
          responseSchema,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setOutputJson(JSON.stringify({ error: data.error }, null, 2));
      } else {
        try {
          const parsed = JSON.parse(data.text);
          setOutputJson(JSON.stringify(parsed, null, 2));
        } catch {
          setOutputJson(data.text);
        }
      }
    } catch (err: any) {
      setOutputJson(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center space-x-3 pb-4 border-b border-zinc-800">
        <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
          <Database className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Structured JSON & Schema Lab</h2>
          <p className="text-xs text-zinc-400">Extract structured data and test Gemini response schemas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-4">
          <form onSubmit={handleExtract} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Extraction Schema</label>
              <select
                value={schemaType}
                onChange={(e) => setSchemaType(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
              >
                <option value="Financial Report">Financial Report Schema</option>
                <option value="General Summary">General Entity & Summary Schema</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Source Text / Document</label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={6}
                placeholder="Paste unstructured text or article here..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !textInput.trim()}
              className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-amber-600/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting JSON...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Extract Structured JSON</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output Preview */}
        <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
            <span className="text-sm font-semibold text-zinc-300">Structured JSON Result</span>
            {outputJson && (
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
                      title: `JSON Schema (${schemaType})`,
                      type: 'json',
                      content: outputJson,
                      tags: ['json', schemaType],
                    })
                  }
                  className="flex items-center space-x-1.5 text-xs bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 overflow-y-auto text-amber-300 text-xs font-mono leading-relaxed whitespace-pre min-h-[400px]">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3 text-zinc-500 font-sans">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                <p className="text-xs">Parsing structured schema with Gemini...</p>
              </div>
            ) : outputJson ? (
              outputJson
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-center space-y-2 font-sans">
                <Braces className="w-10 h-10 stroke-1" />
                <p>Provide source text and extract guaranteed schema JSON.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
