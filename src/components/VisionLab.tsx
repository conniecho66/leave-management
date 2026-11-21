import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles, Copy, Check, Bookmark, Loader2, Camera } from 'lucide-react';
import { ModelName, ThinkingLevelOption, WorkspaceItem } from '../types';

interface VisionLabProps {
  currentModel: ModelName;
  thinkingLevel: ThinkingLevelOption;
  onSaveToWorkspace: (item: Omit<WorkspaceItem, 'id' | 'createdAt'>) => void;
}

export const VisionLab: React.FC<VisionLabProps> = ({ currentModel, thinkingLevel, onSaveToWorkspace }) => {
  const [concept, setConcept] = useState('');
  const [artStyle, setArtStyle] = useState('Cinematic Photorealism');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim() || loading) return;

    setLoading(true);
    setOutput('');

    const prompt = `Act as an expert Art Director and AI Prompt Engineer. Create 3 distinct, highly detailed image generation prompts and a visual storyboard breakdown for the concept: "${concept}". Style: ${artStyle}. Aspect Ratio: ${aspectRatio}. Include lighting descriptions, camera angles, color grading, and descriptive tags.`;

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model: currentModel,
          systemInstruction: 'You are a master art director and visual prompt engineer.',
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
        <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
          <ImageIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Vision & Art Prompt Lab</h2>
          <p className="text-xs text-zinc-400">Craft breathtaking visual prompts, storyboards, and art direction</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-4">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Visual Concept</label>
              <textarea
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                rows={4}
                placeholder="Describe the scene, character, product, or fantasy world..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 focus:outline-none focus:border-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Artistic Style</label>
              <select
                value={artStyle}
                onChange={(e) => setArtStyle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-pink-500"
              >
                <option value="Cinematic Photorealism">Cinematic Photorealism</option>
                <option value="Cyberpunk Neon 3D">Cyberpunk Neon 3D</option>
                <option value="Minimalist Vector Illustration">Minimalist Vector Illustration</option>
                <option value="Oil Painting Masterpiece">Oil Painting Masterpiece</option>
                <option value="Futuristic Concept Art">Futuristic Concept Art</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-pink-500"
              >
                <option value="16:9">16:9 Widescreen</option>
                <option value="1:1">1:1 Square</option>
                <option value="9:16">9:16 Vertical Story</option>
                <option value="4:3">4:3 Standard</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !concept.trim()}
              className="w-full bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-pink-600/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Crafting Prompts...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Craft Visual Prompts</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output Preview */}
        <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
            <span className="text-sm font-semibold text-zinc-300">Prompt & Storyboard Output</span>
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
                      title: `Vision: ${concept.slice(0, 30)}`,
                      type: 'vision',
                      content: output,
                      tags: ['vision', artStyle],
                    })
                  }
                  className="flex items-center space-x-1.5 text-xs bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/30 px-3 py-1.5 rounded-lg transition-colors"
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
                <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
                <p className="text-xs">Generating visual prompts with Gemini...</p>
              </div>
            ) : output ? (
              output
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-center space-y-2">
                <Camera className="w-10 h-10 stroke-1" />
                <p>Describe a visual concept and generate professional AI art prompts.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
