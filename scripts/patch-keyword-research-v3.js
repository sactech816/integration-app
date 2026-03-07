const fs = require('fs');
const path = require('path');

// === 1. Patch YouTubeKeywordResearchEditor.tsx ===
const editorPath = path.resolve(__dirname, '..', 'components', 'youtube-keyword-research', 'YouTubeKeywordResearchEditor.tsx');
let editor = fs.readFileSync(editorPath, 'utf8');

// 1a. Add VPH to SortKey type
editor = editor.replace(
  "type SortKey = 'viewCount' | 'likeCount' | 'commentCount' | 'subscriberCount' | 'viewRatio' | 'publishedAt';",
  "type SortKey = 'viewCount' | 'likeCount' | 'commentCount' | 'subscriberCount' | 'viewRatio' | 'publishedAt' | 'vph';"
);

// 1b. Add VPH to ChartMetric type
editor = editor.replace(
  "type ChartMetric = 'viewCount' | 'likeCount' | 'viewRatio' | 'subscriberCount';",
  "type ChartMetric = 'viewCount' | 'likeCount' | 'viewRatio' | 'subscriberCount' | 'vph';"
);

// 1c. Add new AI analysis types
editor = editor.replace(
  "type AIAnalysisType = 'full' | 'tags' | 'keywords' | 'overseas';",
  "type AIAnalysisType = 'full' | 'tags' | 'keywords' | 'overseas' | 'persona' | 'title-pattern';"
);

// 1d. Add new AI analysis options
editor = editor.replace(
  `  { type: 'overseas', label: '海外バズ動画', icon: '🌍', desc: '海外トレンド分析+日本未上陸の企画提案' },
];`,
  `  { type: 'overseas', label: '海外バズ動画', icon: '🌍', desc: '海外トレンド分析+日本未上陸の企画提案' },
  { type: 'persona', label: 'ペルソナ分析', icon: '🎯', desc: '視聴者ターゲット層・年齢・悩み・目的を推定' },
  { type: 'title-pattern', label: 'タイトル分析', icon: '✏️', desc: 'バズるタイトルのパターン分析+テンプレ提案' },
];`
);

// 1e. Add VPH to SORT_OPTIONS
editor = editor.replace(
  "  { key: 'publishedAt', label: '公開日' },\n];",
  "  { key: 'vph', label: 'VPH' },\n  { key: 'publishedAt', label: '公開日' },\n];"
);

// 1f. Add VPH to CHART_METRICS
editor = editor.replace(
  "  { key: 'likeCount', label: '高評価' },\n];",
  "  { key: 'likeCount', label: '高評価' },\n  { key: 'vph', label: 'VPH(時間あたり再生)' },\n];"
);

// 1g. Add calcVPH helper function after CHART_COLORS
editor = editor.replace(
  "const CHART_COLORS = ['#f43f5e',",
  `function calcVPH(viewCount: number, publishedAt: string): number {
  const hours = (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60);
  if (hours <= 0) return 0;
  return Math.round((viewCount / hours) * 100) / 100;
}

const CHART_COLORS = ['#f43f5e',`
);

// 1h. Update sortedResults to handle VPH sorting
editor = editor.replace(
  `    sorted.sort((a, b) => {
      if (sortKey === 'publishedAt') return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      return (b[sortKey] as number) - (a[sortKey] as number);
    });`,
  `    sorted.sort((a, b) => {
      if (sortKey === 'publishedAt') return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      if (sortKey === 'vph') return calcVPH(b.viewCount, b.publishedAt) - calcVPH(a.viewCount, a.publishedAt);
      return (b[sortKey] as number) - (a[sortKey] as number);
    });`
);

// 1i. Update chartData to handle VPH metric
editor = editor.replace(
  `    return sortedResults.slice(0, 10).map((v, i) => ({
      name: v.title.length > 15 ? v.title.slice(0, 15) + '...' : v.title,
      value: v[chartMetric] as number,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));`,
  `    return sortedResults.slice(0, 10).map((v, i) => ({
      name: v.title.length > 15 ? v.title.slice(0, 15) + '...' : v.title,
      value: chartMetric === 'vph' ? calcVPH(v.viewCount, v.publishedAt) : v[chartMetric] as number,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));`
);

// 1j. Update CSV headers and rows to include VPH and description
editor = editor.replace(
  "const headers = ['順位', 'タイトル', 'チャンネル名', '再生数', 'チャンネル登録数', '再生倍率', '高評価数', 'コメント数', 'エンゲージメント率(%)', '高評価率(%)', '動画時間', '動画公開日', 'タグ', '動画URL'];",
  "const headers = ['順位', 'タイトル', 'チャンネル名', '再生数', 'チャンネル登録数', '再生倍率', 'VPH(時間あたり再生)', '高評価数', 'コメント数', 'エンゲージメント率(%)', '高評価率(%)', '動画時間', '動画公開日', 'タグ', '説明文(冒頭200文字)', '動画URL'];"
);

editor = editor.replace(
  "return [i + 1, '\"' + v.title.replace(/\"/g, '\"\"') + '\"', '\"' + v.channelTitle.replace(/\"/g, '\"\"') + '\"', v.viewCount, v.subscriberCount, v.viewRatio, v.likeCount, v.commentCount, engRate, likeRate, formatDuration(v.duration), v.publishedAt.split('T')[0], '\"' + (v.tags || []).join(', ').replace(/\"/g, '\"\"') + '\"', 'https://www.youtube.com/watch?v=' + v.videoId].join(',');",
  "const vph = calcVPH(v.viewCount, v.publishedAt);\n      const descShort = (v.description || '').slice(0, 200).replace(/\"/g, '\"\"').replace(/\\n/g, ' ');\n      return [i + 1, '\"' + v.title.replace(/\"/g, '\"\"') + '\"', '\"' + v.channelTitle.replace(/\"/g, '\"\"') + '\"', v.viewCount, v.subscriberCount, v.viewRatio, vph, v.likeCount, v.commentCount, engRate, likeRate, formatDuration(v.duration), v.publishedAt.split('T')[0], '\"' + (v.tags || []).join(', ').replace(/\"/g, '\"\"') + '\"', '\"' + descShort + '\"', 'https://www.youtube.com/watch?v=' + v.videoId].join(',');"
);

// 1k. Add Title Pattern Stats to the summary section and expand it
const oldSummary = `            {hasResults && (
              <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3">検索サマリー</h3>
                <div className="space-y-2 text-sm">
                  <SummaryRow label="キーワード" value={searchedKeyword} />
                  <SummaryRow label="結果件数" value={sortedResults.length + '件'} />
                  <SummaryRow label="平均再生数" value={formatNumber(Math.round(sortedResults.reduce((s, v) => s + v.viewCount, 0) / sortedResults.length))} />
                  <SummaryRow label="平均再生倍率" value={(sortedResults.reduce((s, v) => s + v.viewRatio, 0) / sortedResults.length).toFixed(2) + 'x'} />
                  <SummaryRow label="平均登録者数" value={formatNumber(Math.round(sortedResults.reduce((s, v) => s + v.subscriberCount, 0) / sortedResults.length))} />
                </div>
              </div>
            )}`;

const newSummary = `            {hasResults && (
              <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3">検索サマリー</h3>
                <div className="space-y-2 text-sm">
                  <SummaryRow label="キーワード" value={searchedKeyword} />
                  <SummaryRow label="結果件数" value={sortedResults.length + '件'} />
                  <SummaryRow label="平均再生数" value={formatNumber(Math.round(sortedResults.reduce((s, v) => s + v.viewCount, 0) / sortedResults.length))} />
                  <SummaryRow label="平均再生倍率" value={(sortedResults.reduce((s, v) => s + v.viewRatio, 0) / sortedResults.length).toFixed(2) + 'x'} />
                  <SummaryRow label="平均VPH" value={Math.round(sortedResults.reduce((s, v) => s + calcVPH(v.viewCount, v.publishedAt), 0) / sortedResults.length).toLocaleString()} />
                  <SummaryRow label="平均登録者数" value={formatNumber(Math.round(sortedResults.reduce((s, v) => s + v.subscriberCount, 0) / sortedResults.length))} />
                </div>
              </div>
            )}

            {/* Title Pattern Analysis */}
            {hasResults && <TitlePatternCard results={sortedResults} />}`;

editor = editor.replace(oldSummary, newSummary);

// 1l. Add VPH badge and expandable description to video cards
const oldVideoCard = `                {sortedResults.map((v, i) => (
                  <div key={v.videoId} className="bg-gray-700/50 rounded-xl p-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-36 relative group">
                        <a href={'https://www.youtube.com/watch?v=' + v.videoId} target="_blank" rel="noopener noreferrer">
                          <div className="rounded-lg overflow-hidden">
                            <img src={v.thumbnailUrl} alt={v.title} className="w-full aspect-video object-cover" />
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg flex items-center justify-center">
                            <ExternalLink className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </a>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <span className="text-rose-400 font-bold text-xs flex-shrink-0 mt-0.5">#{i + 1}</span>
                          <a href={'https://www.youtube.com/watch?v=' + v.videoId} target="_blank" rel="noopener noreferrer" className="text-white font-bold text-sm leading-snug line-clamp-2 hover:text-rose-300 transition-colors">
                            {v.title}
                          </a>
                        </div>
                        <a href={'https://www.youtube.com/channel/' + v.channelId} target="_blank" rel="noopener noreferrer" className="text-gray-400 text-xs mb-2 block hover:text-rose-300 transition-colors">
                          {v.channelTitle} / {formatDateStr(v.publishedAt)}{v.duration ? ' / ' + formatDuration(v.duration) : ''}
                        </a>
                        <div className="flex flex-wrap gap-2">
                          <MetricBadge icon={Eye} value={formatNumber(v.viewCount)} color="blue" />
                          <MetricBadge icon={Users} value={formatNumber(v.subscriberCount)} color="red" />
                          <MetricBadge icon={TrendingUp} value={v.viewRatio + 'x'} color={v.viewRatio >= 2 ? 'green' : 'gray'} />
                          <MetricBadge icon={ThumbsUp} value={formatNumber(v.likeCount)} color="emerald" />
                          <MetricBadge icon={MessageCircle} value={formatNumber(v.commentCount)} color="amber" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}`;

const newVideoCard = `                {sortedResults.map((v, i) => (
                  <VideoCard key={v.videoId} video={v} index={i} formatDateStr={formatDateStr} />
                ))}`;

editor = editor.replace(oldVideoCard, newVideoCard);

// 1m. Add import for Clock (already imported), and add Zap icon
editor = editor.replace(
  "  Trash2, ChevronDown, ChevronRight, CheckSquare, Square, Sparkles, Bot, Copy,",
  "  Trash2, ChevronDown, ChevronRight, CheckSquare, Square, Sparkles, Bot, Copy, Zap, FileText, ChevronUp,"
);

// 1n. Add TitlePatternCard and VideoCard components before the SummaryRow
const titlePatternAndVideoCard = `
function TitlePatternCard({ results }: { results: YouTubeVideoData[] }) {
  const stats = useMemo(() => {
    const titles = results.map(v => v.title);
    const hasNumber = titles.filter(t => /\\d/.test(t)).length;
    const hasQuestion = titles.filter(t => /[？?]/.test(t)).length;
    const hasExclamation = titles.filter(t => /[！!]/.test(t)).length;
    const hasBrackets = titles.filter(t => /[【\\[「『]/.test(t)).length;
    const avgLength = Math.round(titles.reduce((s, t) => s + t.length, 0) / titles.length);
    const maxViewVideo = results.reduce((best, v) => v.viewCount > best.viewCount ? v : best, results[0]);
    const maxRatioVideo = results.reduce((best, v) => v.viewRatio > best.viewRatio ? v : best, results[0]);
    const pct = (n: number) => Math.round((n / titles.length) * 100);
    return { hasNumber: pct(hasNumber), hasQuestion: pct(hasQuestion), hasExclamation: pct(hasExclamation), hasBrackets: pct(hasBrackets), avgLength, maxViewVideo, maxRatioVideo, total: titles.length };
  }, [results]);

  return (
    <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-5 h-5 text-rose-600" />
        <h3 className="text-sm font-bold text-gray-900">タイトルパターン分析</h3>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <PatternStat label="数字を含む" value={stats.hasNumber + '%'} />
        <PatternStat label="疑問形（？）" value={stats.hasQuestion + '%'} />
        <PatternStat label="感嘆符（！）" value={stats.hasExclamation + '%'} />
        <PatternStat label="括弧【】「」" value={stats.hasBrackets + '%'} />
      </div>
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between text-gray-600">
          <span>平均タイトル文字数</span>
          <span className="font-bold text-gray-900">{stats.avgLength}文字</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>最多再生タイトル</span>
          <span className="font-bold text-gray-900 text-right max-w-[60%] truncate" title={stats.maxViewVideo.title}>{stats.maxViewVideo.title}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>最高倍率タイトル</span>
          <span className="font-bold text-gray-900 text-right max-w-[60%] truncate" title={stats.maxRatioVideo.title}>{stats.maxRatioVideo.title}</span>
        </div>
      </div>
    </div>
  );
}

function PatternStat({ label, value }: { label: string; value: string }) {
  const pct = parseInt(value);
  return (
    <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="flex items-end gap-1.5">
        <span className="text-lg font-bold text-gray-900">{value}</span>
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1.5">
          <div className="h-full bg-rose-400 rounded-full" style={{ width: Math.min(pct, 100) + '%' }} />
        </div>
      </div>
    </div>
  );
}

function VideoCard({ video: v, index: i, formatDateStr }: { video: YouTubeVideoData; index: number; formatDateStr: (s: string) => string }) {
  const [showDesc, setShowDesc] = useState(false);
  const vph = calcVPH(v.viewCount, v.publishedAt);
  const descPreview = (v.description || '').slice(0, 300);
  const hasDesc = !!v.description && v.description.length > 0;

  return (
    <div className="bg-gray-700/50 rounded-xl p-3">
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-36 relative group">
          <a href={'https://www.youtube.com/watch?v=' + v.videoId} target="_blank" rel="noopener noreferrer">
            <div className="rounded-lg overflow-hidden">
              <img src={v.thumbnailUrl} alt={v.title} className="w-full aspect-video object-cover" />
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg flex items-center justify-center">
              <ExternalLink className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </a>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <span className="text-rose-400 font-bold text-xs flex-shrink-0 mt-0.5">#{i + 1}</span>
            <a href={'https://www.youtube.com/watch?v=' + v.videoId} target="_blank" rel="noopener noreferrer" className="text-white font-bold text-sm leading-snug line-clamp-2 hover:text-rose-300 transition-colors">
              {v.title}
            </a>
          </div>
          <a href={'https://www.youtube.com/channel/' + v.channelId} target="_blank" rel="noopener noreferrer" className="text-gray-400 text-xs mb-2 block hover:text-rose-300 transition-colors">
            {v.channelTitle} / {formatDateStr(v.publishedAt)}{v.duration ? ' / ' + formatDuration(v.duration) : ''}
          </a>
          <div className="flex flex-wrap gap-2">
            <MetricBadge icon={Eye} value={formatNumber(v.viewCount)} color="blue" />
            <MetricBadge icon={Users} value={formatNumber(v.subscriberCount)} color="red" />
            <MetricBadge icon={TrendingUp} value={v.viewRatio + 'x'} color={v.viewRatio >= 2 ? 'green' : 'gray'} />
            <MetricBadge icon={Zap} value={vph.toLocaleString() + '/h'} color={vph >= 100 ? 'amber' : 'gray'} />
            <MetricBadge icon={ThumbsUp} value={formatNumber(v.likeCount)} color="emerald" />
            <MetricBadge icon={MessageCircle} value={formatNumber(v.commentCount)} color="amber" />
          </div>
        </div>
      </div>
      {hasDesc && (
        <div className="mt-2">
          <button onClick={() => setShowDesc(!showDesc)} className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-200 transition-colors">
            <FileText className="w-3 h-3" />
            {showDesc ? '説明文を閉じる' : '説明文を表示'}
            {showDesc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {showDesc && (
            <div className="mt-1.5 p-2.5 bg-gray-800/50 rounded-lg text-[11px] text-gray-400 leading-relaxed whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
              {descPreview}{v.description && v.description.length > 300 ? '...' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

`;

editor = editor.replace(
  '\nfunction SummaryRow(',
  titlePatternAndVideoCard + 'function SummaryRow('
);

// 1o. Add useState import for VideoCard (already imported at top)

fs.writeFileSync(editorPath, editor, 'utf8');
console.log('Editor patched successfully!');


// === 2. Patch AI Analysis API to add persona and title-pattern types ===
const aiApiPath = path.resolve(__dirname, '..', 'app', 'api', 'youtube-keyword-research', 'ai-analysis', 'route.ts');
let aiApi = fs.readFileSync(aiApiPath, 'utf8');

// Add new analysis types to the type
aiApi = aiApi.replace(
  "analysisType: 'full' | 'tags' | 'keywords' | 'overseas'",
  "analysisType: 'full' | 'tags' | 'keywords' | 'overseas' | 'persona' | 'title-pattern'"
);

// Add persona and title-pattern prompts before the final provider.generate call
const personaBlock = `
    } else if (analysisType === 'persona') {
      systemPrompt = 'あなたはYouTubeマーケティングとペルソナ分析の専門家です。動画データから視聴者ターゲット層を詳細に推定してください。マークダウン形式で出力してください。';
      userPrompt = \`キーワード「\${keyword}」の上位動画データ:
\${JSON.stringify(videoSummaries, null, 2)}

以下を詳細に分析・推定してください:

## メインターゲット層

### 基本属性
- 推定年齢層（メイン/サブ）
- 性別比率（推定）
- 推定職業・業種（具体的に3〜5つ）
- 推定年収レンジ
- 居住地域の傾向

### 心理属性
- このジャンルを見る主な目的（3〜5つ）
- 抱えている悩み・課題（具体的に5〜7つ）
- 達成したいゴール（3〜5つ）
- 障壁になっていること（3〜5つ）

### 視聴行動
- 視聴シチュエーション（いつ・どこで・何をしながら見るか）
- 他に見ていそうなジャンル・チャンネル
- 購買意欲の高い商品・サービス
- SNS利用傾向（YouTube以外）

## サブターゲット層（2〜3パターン）
各パターンについて簡潔に属性・目的・悩みを記載

## ペルソナ具体例（2名分）
- 名前（架空）、年齢、職業、家族構成
- 1日のタイムスケジュール（YouTube視聴タイミング含む）
- この検索キーワードに至った背景ストーリー

## ターゲットに刺さるコンテンツ戦略
- タイトルで使うべきキーワード・表現
- サムネイルで訴求すべきポイント
- 動画冒頭で引きつけるフック案（3つ）
- 概要欄に書くべきCTA\`;

    } else if (analysisType === 'title-pattern') {
      systemPrompt = 'あなたはYouTubeタイトル最適化の専門家です。上位動画のタイトルを徹底分析し、バズるタイトルのパターンと具体的なテンプレートを提案してください。マークダウン形式で出力してください。';
      userPrompt = \`キーワード「\${keyword}」の上位動画データ:
\${JSON.stringify(videoSummaries, null, 2)}

以下を詳細に分析してください:

## タイトルパターン分類

### 使用されている手法の頻度分析
- 数字を含むタイトルの割合と効果（再生倍率との相関）
- 疑問形タイトルの割合と効果
- 感嘆符・煽り表現の使用状況
- 括弧【】「」の使用パターン
- ネガティブ訴求 vs ポジティブ訴求の比率

### 文字数分析
- 上位動画の平均文字数
- 再生倍率300%超え動画の文字数傾向
- 推奨文字数レンジ

## 高パフォーマンスタイトルの共通点
再生倍率が高い動画のタイトルに共通する要素を5つ以上

## タイトルテンプレート（15パターン）

各テンプレートに以下を含める:
- パターン名（例: 「数字+ベネフィット型」）
- テンプレート構文（例: 「【○○】△△するだけで□□になる方法」）
- 「\${keyword}」を使った具体的なタイトル例
- このパターンが効果的な理由
- 推定クリック率の評価（★1〜5）

カテゴリ別に整理:
1. 初心者向け（5パターン）
2. 中級者向け（5パターン）
3. バズ狙い（5パターン）

## NGタイトルパターン
避けるべきタイトルの特徴（3〜5つ）と理由

## A/Bテスト提案
同じ内容の動画で試すべきタイトルバリエーション（3セット）\`;
`;

aiApi = aiApi.replace(
  `    }

    const response = await provider.generate({`,
  personaBlock + `
    }

    const response = await provider.generate({`
);

fs.writeFileSync(aiApiPath, aiApi, 'utf8');
console.log('AI Analysis API patched successfully!');

console.log('\n=== All patches applied! ===');
