const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '..', 'components', 'youtube-keyword-research', 'YouTubeKeywordResearchEditor.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add new imports: Sparkles, Bot, Copy
content = content.replace(
  "  Trash2, ChevronDown, ChevronRight, CheckSquare, Square,",
  "  Trash2, ChevronDown, ChevronRight, CheckSquare, Square, Sparkles, Bot, Copy,"
);

// 2. Add AI analysis types after SearchHistoryItem type
const aiTypes = `
type AIAnalysisType = 'full' | 'tags' | 'keywords' | 'overseas';

const AI_ANALYSIS_OPTIONS: { type: AIAnalysisType; label: string; icon: string; desc: string }[] = [
  { type: 'full', label: '総合分析', icon: '📊', desc: '市場概況・バズ特徴・企画アイデアを一括分析' },
  { type: 'tags', label: 'タグ作成', icon: '🏷️', desc: 'チャンネルタグ30個+ハッシュタグ15個を提案' },
  { type: 'keywords', label: 'キーワード100選', icon: '🔑', desc: 'ヒットキーワード100選+穴場キーワード提案' },
  { type: 'overseas', label: '海外バズ動画', icon: '🌍', desc: '海外トレンド分析+日本未上陸の企画提案' },
];
`;
content = content.replace(
  "const STORAGE_KEY = 'yt-keyword-research-history';",
  aiTypes + "\nconst STORAGE_KEY = 'yt-keyword-research-history';"
);

// 3. Add AI state variables after activeHistoryId state
content = content.replace(
  "  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);",
  `  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  // AI Analysis
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [showAiPanel, setShowAiPanel] = useState(false);`
);

// 4. Add AI analysis handler after exportSelectedHistory function
const aiHandler = `
  const handleAIAnalysis = async (analysisType: AIAnalysisType) => {
    if (sortedResults.length === 0) return;
    setAiLoading(true);
    setAiError('');
    setAiAnalysis(null);
    setShowAiPanel(true);

    try {
      const res = await fetch('/api/youtube-keyword-research/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: searchedKeyword,
          results: sortedResults,
          analysisType,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setAiError(data.error || 'AI分析に失敗しました'); return; }
      setAiAnalysis(data.analysis);
    } catch {
      setAiError('通信エラーが発生しました');
    } finally {
      setAiLoading(false);
    }
  };

  const copyAiAnalysis = () => {
    if (!aiAnalysis) return;
    navigator.clipboard.writeText(aiAnalysis);
  };

`;
content = content.replace(
  "  if (!user) return null;",
  aiHandler + "  if (!user) return null;"
);

// 5. Add AI analysis buttons in the right panel, after the chart metric toggle buttons
// Find the video cards section marker and insert AI section before it
const aiButtonsSection = `
                {/* AI Analysis Buttons */}
                <div className="bg-gray-700/50 rounded-xl p-4">
                  <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    AI分析
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
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
                  </div>
                  <p className="text-gray-500 text-[10px] mt-2 text-center">Gemini 2.5 Flash使用 / 1回約0.3円</p>
                </div>

                {/* AI Analysis Results */}
                {showAiPanel && (
                  <div className="bg-gray-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-bold text-sm flex items-center gap-2">
                        <Bot className="w-4 h-4 text-cyan-400" />
                        AI分析レポート
                      </h3>
                      {aiAnalysis && (
                        <button onClick={copyAiAnalysis} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
                          <Copy className="w-3.5 h-3.5" />
                          コピー
                        </button>
                      )}
                    </div>
                    {aiLoading && (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-3" />
                        <p className="text-sm font-semibold">AI分析中...</p>
                        <p className="text-xs mt-1">30秒ほどお待ちください</p>
                      </div>
                    )}
                    {aiError && (
                      <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/30 p-3 rounded-lg">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{aiError}</span>
                      </div>
                    )}
                    {aiAnalysis && (
                      <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed ai-analysis-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(aiAnalysis) }} />
                    )}
                  </div>
                )}
`;

// Insert before the video cards section
content = content.replace(
  "                {sortedResults.map((v, i) => (",
  aiButtonsSection + "\n                {sortedResults.map((v, i) => ("
);

// 6. Add simple markdown renderer function before the CHART_COLORS
const markdownRenderer = `
function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h4 class="text-white font-bold text-sm mt-4 mb-2">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="text-white font-bold text-base mt-5 mb-2 pb-1 border-b border-gray-600">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 class="text-white font-bold text-lg mt-6 mb-3">$1</h2>')
    .replace(/\\*\\*(.+?)\\*\\*/g, '<strong class="text-white">$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^(\\d+)\\. (.+)$/gm, '<li class="ml-4 list-decimal">$2</li>')
    .replace(/\`([^\`]+)\`/g, '<code class="bg-gray-600 px-1.5 py-0.5 rounded text-cyan-300 text-xs">$1</code>')
    .replace(/\\n\\n/g, '<br/><br/>')
    .replace(/\\n/g, '<br/>');
}

`;
content = content.replace(
  "const CHART_COLORS =",
  markdownRenderer + "const CHART_COLORS ="
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('AI analysis UI patched successfully!');
