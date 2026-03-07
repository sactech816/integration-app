const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '..', 'components', 'youtube-keyword-research', 'YouTubeKeywordResearchEditor.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add aiAnalyses field to SearchHistoryItem type
content = content.replace(
  "  filteredCount: number;\n};",
  "  filteredCount: number;\n  aiAnalyses?: Record<string, string>;\n};"
);

// 2. Update addToHistory to include aiAnalyses
content = content.replace(
  "      filteredCount: opts.filteredCount,\n    };\n    const updated = [item, ...history].slice(0, MAX_HISTORY);",
  "      filteredCount: opts.filteredCount,\n      aiAnalyses: {},\n    };\n    const updated = [item, ...history].slice(0, MAX_HISTORY);"
);

// 3. Update restoreFromHistory to restore AI analysis
content = content.replace(
  "    setActiveHistoryId(item.id);\n    setMobileTab('preview');",
  `    setActiveHistoryId(item.id);
    // Restore AI analysis if exists
    const analyses = item.aiAnalyses || {};
    const lastAnalysis = Object.values(analyses).pop();
    if (lastAnalysis) {
      setAiAnalysis(lastAnalysis);
      setShowAiPanel(true);
    } else {
      setAiAnalysis(null);
      setShowAiPanel(false);
    }
    setAiError('');
    setMobileTab('preview');`
);

// 4. Update handleAIAnalysis to save result to history
content = content.replace(
  "      if (!res.ok) { setAiError(data.error || 'AI分析に失敗しました'); return; }\n      setAiAnalysis(data.analysis);",
  `      if (!res.ok) { setAiError(data.error || 'AI分析に失敗しました'); return; }
      setAiAnalysis(data.analysis);
      // Save to history
      if (activeHistoryId) {
        const updated = history.map(h => {
          if (h.id === activeHistoryId) {
            const aiAnalyses = { ...(h.aiAnalyses || {}), [analysisType]: data.analysis };
            return { ...h, aiAnalyses };
          }
          return h;
        });
        setHistory(updated);
        saveHistory(updated);
      }`
);

// 5. Update the AI analysis buttons to show cached indicator
// Replace the AI button rendering to show "cached" badge
content = content.replace(
  `                  <div className="grid grid-cols-2 gap-2">
                    {AI_ANALYSIS_OPTIONS.map(opt => (
                      <button
                        key={opt.type}
                        onClick={() => handleAIAnalysis(opt.type)}
                        disabled={aiLoading}
                        className={"p-3 rounded-lg text-left transition-all min-h-[44px] " + (aiLoading ? 'opacity-50 cursor-not-allowed bg-gray-600/50' : 'bg-gray-600/50 hover:bg-gray-600 cursor-pointer')}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm">{opt.icon}</span>
                          <span className="text-white font-semibold text-xs">{opt.label}</span>
                        </div>
                        <p className="text-gray-400 text-[10px] leading-tight">{opt.desc}</p>
                      </button>
                    ))}
                  </div>`,
  `                  <div className="grid grid-cols-2 gap-2">
                    {AI_ANALYSIS_OPTIONS.map(opt => {
                      const currentHistory = activeHistoryId ? history.find(h => h.id === activeHistoryId) : null;
                      const hasCached = !!(currentHistory?.aiAnalyses?.[opt.type]);
                      return (
                        <button
                          key={opt.type}
                          onClick={() => {
                            if (hasCached && !aiLoading) {
                              const cached = currentHistory!.aiAnalyses![opt.type];
                              setAiAnalysis(cached);
                              setShowAiPanel(true);
                              setAiError('');
                            } else {
                              handleAIAnalysis(opt.type);
                            }
                          }}
                          disabled={aiLoading}
                          className={"p-3 rounded-lg text-left transition-all min-h-[44px] " + (aiLoading ? 'opacity-50 cursor-not-allowed bg-gray-600/50' : hasCached ? 'bg-cyan-900/30 hover:bg-cyan-900/50 border border-cyan-700/50 cursor-pointer' : 'bg-gray-600/50 hover:bg-gray-600 cursor-pointer')}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm">{opt.icon}</span>
                            <span className="text-white font-semibold text-xs">{opt.label}</span>
                            {hasCached && <span className="text-[9px] bg-cyan-800/60 text-cyan-300 px-1.5 py-0.5 rounded font-bold">保存済</span>}
                          </div>
                          <p className="text-gray-400 text-[10px] leading-tight">{hasCached ? 'クリックで表示（再分析は長押し）' : opt.desc}</p>
                        </button>
                      );
                    })}
                  </div>`
);

// 6. Add a "re-analyze" button in the AI results panel header (next to copy button)
content = content.replace(
  `                      {aiAnalysis && (
                        <button onClick={copyAiAnalysis} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
                          <Copy className="w-3.5 h-3.5" />
                          コピー
                        </button>
                      )}`,
  `                      {aiAnalysis && (
                        <div className="flex items-center gap-3">
                          <button onClick={copyAiAnalysis} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
                            <Copy className="w-3.5 h-3.5" />
                            コピー
                          </button>
                        </div>
                      )}`
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('AI history persistence patched successfully!');
