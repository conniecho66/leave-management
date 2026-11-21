import React, { useState } from 'react';
import { FolderKanban, Search, Trash2, Copy, Download, Star, Tag, X, FileText, Code2, Image as ImageIcon, Database, MessageSquare } from 'lucide-react';
import { WorkspaceItem } from '../types';

interface WorkspaceManagerProps {
  items: WorkspaceItem[];
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  onClose?: () => void;
}

export const WorkspaceManager: React.FC<WorkspaceManagerProps> = ({ items, onDeleteItem, onClearAll, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<WorkspaceItem | null>(null);

  // Extract all unique tags
  const allTags = Array.from(new Set(items.flatMap((item) => item.tags)));

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || item.content.toLowerCase().includes(search.toLowerCase());
    const matchesTag = selectedTag ? item.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case 'chat': return <MessageSquare className="w-4 h-4 text-indigo-400" />;
      case 'writer': return <FileText className="w-4 h-4 text-violet-400" />;
      case 'code': return <Code2 className="w-4 h-4 text-cyan-400" />;
      case 'vision': return <ImageIcon className="w-4 h-4 text-pink-400" />;
      case 'json': return <Database className="w-4 h-4 text-amber-400" />;
      default: return <FolderKanban className="w-4 h-4 text-zinc-400" />;
    }
  };

  const exportAsFile = (item: WorkspaceItem) => {
    const element = document.createElement('a');
    const file = new Blob([item.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${item.type === 'json' ? 'json' : 'txt'}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Workspace & Saved Creations</h2>
            <p className="text-xs text-zinc-400">Organize, export, and review your AI-generated assets</p>
          </div>
        </div>
        {items.length > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center space-x-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Search and Tags */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved items..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedTag === null ? 'bg-emerald-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedTag === tag ? 'bg-emerald-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-zinc-600 space-y-3 min-h-[300px]">
          <FolderKanban className="w-12 h-12 stroke-1" />
          <p className="text-sm">No saved items found in your workspace.</p>
          <p className="text-xs text-zinc-500">Save outputs from Chat, Writer, Code, Vision, or JSON labs to view them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveItem(item)}
              className="bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 p-4 rounded-2xl flex flex-col justify-between space-y-3 cursor-pointer transition-all shadow-sm hover:shadow-md group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getIconForType(item.type)}
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{item.type}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">
                    {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-3 font-normal leading-relaxed">
                  {item.content}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                <div className="flex items-center space-x-1 flex-wrap">
                  {item.tags.slice(0, 2).map((t) => (
                    <span key={t} className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md">
                      #{t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => exportAsFile(item)}
                    className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                    title="Export File"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Item Detail Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-3xl max-h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <div className="flex items-center space-x-2">
                {getIconForType(activeItem.type)}
                <h3 className="text-base font-bold text-white">{activeItem.title}</h3>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-zinc-950 font-mono text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed">
              {activeItem.content}
            </div>

            <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {activeItem.tags.map((t) => (
                  <span key={t} className="text-xs bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-md">
                    #{t}
                  </span>
                ))}
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeItem.content);
                    alert('Copied to clipboard!');
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </button>
                <button
                  onClick={() => exportAsFile(activeItem)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-white transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
