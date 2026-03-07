const fs = require('fs');
const path = require('path');

// ============================================================
// 1. Patch API route: add `order` param + `hasCaption` field
// ============================================================
const apiPath = path.resolve(__dirname, '..', 'app', 'api', 'youtube-keyword-research', 'route.ts');
let api = fs.readFileSync(apiPath, 'utf8');

// 1a. Accept `order` from request body
api = api.replace(
  "const { keyword, maxResults = 20, publishedAfter } = body;",
  "const { keyword, maxResults = 20, publishedAfter, order = 'relevance' } = body;"
);

// 1b. Use `order` param in search
api = api.replace(
  "      order: 'relevance',",
  "      order: ['relevance', 'viewCount', 'date', 'rating'].includes(order) ? order : 'relevance',"
);

// 1c. Add hasCaption to the result mapping
api = api.replace(
  "        duration: item.contentDetails?.duration || '',",
  "        duration: item.contentDetails?.duration || '',\n        hasCaption: item.contentDetails?.caption === 'true',"
);

fs.writeFileSync(apiPath, api, 'utf8');
console.log('API route patched (order + hasCaption)');


// ============================================================
// 2. Patch YouTubeVideoData type: add hasCaption
// ============================================================
const typesPath = path.resolve(__dirname, '..', 'lib', 'youtube.ts');
let types = fs.readFileSync(typesPath, 'utf8');
types = types.replace(
  "  duration: string;\n};",
  "  duration: string;\n  hasCaption: boolean;\n};"
);
fs.writeFileSync(typesPath, types, 'utf8');
console.log('YouTubeVideoData type patched (hasCaption)');


// ============================================================
// 3. Patch Editor component
// ============================================================
const editorPath = path.resolve(__dirname, '..', 'components', 'youtube-keyword-research', 'YouTubeKeywordResearchEditor.tsx');
let ed = fs.readFileSync(editorPath, 'utf8');

// 3a. Add SearchOrder type after DateRange
ed = ed.replace(
  "type DateRange = '' | '1month' | '3months' | '6months' | '1year';",
  "type DateRange = '' | '1month' | '3months' | '6months' | '1year';\ntype SearchOrder = 'relevance' | 'viewCount' | 'date' | 'rating';"
);

// 3b. Add SearchOrder options after DATE_RANGE_OPTIONS
ed = ed.replace(
  "const CHART_METRICS:",
  `const SEARCH_ORDER_OPTIONS: { value: SearchOrder; label: string; desc: string }[] = [
  { value: 'relevance', label: '関連性順', desc: 'キーワードとの関連度' },
  { value: 'viewCount', label: '再生数順', desc: 'vidIQと同じ並び順' },
  { value: 'date', label: '新着順', desc: '最近公開された動画優先' },
  { value: 'rating', label: '評価順', desc: '高評価の動画優先' },
];

const CHART_METRICS:`
);

// 3c. Add searchOrder state
ed = ed.replace(
  "  const [dateRange, setDateRange] = useState<DateRange>('');",
  "  const [dateRange, setDateRange] = useState<DateRange>('');\n  const [searchOrder, setSearchOrder] = useState<SearchOrder>('relevance');"
);

// 3d. Send order to API
ed = ed.replace(
  "body: JSON.stringify({ keyword: keyword.trim(), maxResults, publishedAfter }),",
  "body: JSON.stringify({ keyword: keyword.trim(), maxResults, publishedAfter, order: searchOrder }),"
);

// 3e. Add search order selector UI (change grid from 2 to 3 cols)
ed = ed.replace(
  `              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">公開日</label>
                  <select value={dateRange} onChange={(e) => setDateRange(e.target.value as DateRange)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent">
                    {DATE_RANGE_OPTIONS.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">取得件数</label>`,
  `              <div className="grid grid-cols-3 gap-3 mt-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">API並び順</label>
                  <select value={searchOrder} onChange={(e) => setSearchOrder(e.target.value as SearchOrder)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent">
                    {SEARCH_ORDER_OPTIONS.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">公開日</label>
                  <select value={dateRange} onChange={(e) => setDateRange(e.target.value as DateRange)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent">
                    {DATE_RANGE_OPTIONS.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">取得件数</label>`
);

// 3f. Fix chart: Tooltip text color + label style + item style
ed = ed.replace(
  `<Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} formatter={(value: number) => [chartMetric === 'viewRatio' ? value + 'x' : formatNumber(value), CHART_METRICS.find(m => m.key === chartMetric)?.label || '']} />`,
  `<Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} labelStyle={{ color: '#d1d5db' }} itemStyle={{ color: '#fff' }} formatter={(value: number) => [chartMetric === 'viewRatio' ? value + 'x' : chartMetric === 'vph' ? value.toLocaleString() + '/h' : formatNumber(value), CHART_METRICS.find(m => m.key === chartMetric)?.label || '']} />`
);

// 3g. Add click handler to chart bars - scroll to video card
// We need to add an onClick to the Bar and add videoId to chartData
ed = ed.replace(
  `    return sortedResults.slice(0, 10).map((v, i) => ({
      name: v.title.length > 15 ? v.title.slice(0, 15) + '...' : v.title,
      value: chartMetric === 'vph' ? calcVPH(v.viewCount, v.publishedAt) : v[chartMetric] as number,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));`,
  `    return sortedResults.slice(0, 10).map((v, i) => ({
      name: v.title.length > 15 ? v.title.slice(0, 15) + '...' : v.title,
      value: chartMetric === 'vph' ? calcVPH(v.viewCount, v.publishedAt) : v[chartMetric] as number,
      color: CHART_COLORS[i % CHART_COLORS.length],
      videoId: v.videoId,
    }));`
);

// Replace Bar element to add onClick
ed = ed.replace(
  `<Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>`,
  `<Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30} cursor="pointer" onClick={(data: any) => { if (data?.videoId) { const el = document.getElementById('video-' + data.videoId); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }}>`
);

// 3h. Add id to VideoCard for scroll targeting
ed = ed.replace(
  `                {sortedResults.map((v, i) => (
                  <VideoCard key={v.videoId} video={v} index={i} formatDateStr={formatDateStr} />`,
  `                {sortedResults.map((v, i) => (
                  <VideoCard key={v.videoId} video={v} index={i} formatDateStr={formatDateStr} searchedKeyword={searchedKeyword} />`
);

// 3i. Update VideoCard component to add id and accept searchedKeyword
ed = ed.replace(
  `function VideoCard({ video: v, index: i, formatDateStr }: { video: YouTubeVideoData; index: number; formatDateStr: (s: string) => string }) {`,
  `function VideoCard({ video: v, index: i, formatDateStr, searchedKeyword = '' }: { video: YouTubeVideoData; index: number; formatDateStr: (s: string) => string; searchedKeyword?: string }) {`
);

ed = ed.replace(
  `  return (
    <div className="bg-gray-700/50 rounded-xl p-3">
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-36 relative group">
          <a href={'https://www.youtube.com/watch?v=' + v.videoId}`,
  `  return (
    <div id={'video-' + v.videoId} className="bg-gray-700/50 rounded-xl p-3 scroll-mt-4">
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-36 relative group">
          <a href={'https://www.youtube.com/watch?v=' + v.videoId}`
);

// 3j. Expand summary with vidIQ-style stats
const oldSummary = `            {/* Summary */}
            {hasResults && (
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
            )}`;

const newSummary = `            {/* Summary - vidIQ style */}
            {hasResults && <VidIQStyleSummary results={sortedResults} keyword={searchedKeyword} />}`;

ed = ed.replace(oldSummary, newSummary);

// 3k. Add VidIQStyleSummary component before TitlePatternCard
const vidiqComponent = `
function VidIQStyleSummary({ results, keyword }: { results: YouTubeVideoData[]; keyword: string }) {
  const stats = useMemo(() => {
    const len = results.length;
    if (len === 0) return null;
    const maxViews = Math.max(...results.map(v => v.viewCount));
    const avgViews = Math.round(results.reduce((s, v) => s + v.viewCount, 0) / len);
    const avgSubs = Math.round(results.reduce((s, v) => s + v.subscriberCount, 0) / len);
    const avgVPH = Math.round(results.reduce((s, v) => s + calcVPH(v.viewCount, v.publishedAt), 0) / len);
    const avgRatio = (results.reduce((s, v) => s + v.viewRatio, 0) / len).toFixed(2);

    // Last 7 days
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const last7Days = results.filter(v => new Date(v.publishedAt).getTime() >= sevenDaysAgo).length;

    // Average age
    const avgAgeMs = results.reduce((s, v) => s + (Date.now() - new Date(v.publishedAt).getTime()), 0) / len;
    const avgAgeDays = Math.round(avgAgeMs / (1000 * 60 * 60 * 24));
    let ageLabel = '';
    if (avgAgeDays >= 365) {
      const years = Math.round(avgAgeDays / 365 * 10) / 10;
      ageLabel = years + '年';
    } else if (avgAgeDays >= 30) {
      ageLabel = Math.round(avgAgeDays / 30) + 'ヶ月';
    } else {
      ageLabel = avgAgeDays + '日';
    }

    // CC (caption)
    const ccCount = results.filter(v => v.hasCaption).length;

    // Keyword in title/desc
    const kw = keyword.toLowerCase();
    const kwParts = kw.split(/\\s+/).filter(Boolean);
    const titleHasKw = results.filter(v => kwParts.some(k => v.title.toLowerCase().includes(k))).length;
    const descHasKw = results.filter(v => kwParts.some(k => (v.description || '').toLowerCase().includes(k))).length;

    // Top creator (most videos)
    const channelCount: Record<string, { count: number; name: string }> = {};
    results.forEach(v => {
      if (!channelCount[v.channelId]) channelCount[v.channelId] = { count: 0, name: v.channelTitle };
      channelCount[v.channelId].count++;
    });
    const topCreator = Object.values(channelCount).sort((a, b) => b.count - a.count)[0];

    return { maxViews, avgViews, avgSubs, avgVPH, avgRatio, last7Days, ageLabel, ccCount, titleHasKw, descHasKw, topCreator, total: len };
  }, [results, keyword]);

  if (!stats) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-rose-600" />
        <h3 className="text-sm font-bold text-gray-900">検索サマリー</h3>
        <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-bold">vidIQ風</span>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <SummaryRow label="キーワード" value={keyword} />
        <SummaryRow label="結果件数" value={stats.total + '件'} />
        <SummaryRow label="最高再生数" value={formatNumber(stats.maxViews)} highlight />
        <SummaryRow label="平均再生数" value={formatNumber(stats.avgViews)} />
        <SummaryRow label="平均登録者数" value={formatNumber(stats.avgSubs)} />
        <SummaryRow label="平均再生倍率" value={stats.avgRatio + 'x'} />
        <SummaryRow label="平均VPH" value={stats.avgVPH.toLocaleString() + '/h'} />
        <SummaryRow label="平均年齢" value={stats.ageLabel} />
        <SummaryRow label="直近7日の動画" value={stats.last7Days + '/' + stats.total} />
        <SummaryRow label="字幕(CC)あり" value={stats.ccCount + '/' + stats.total} />
        <SummaryRow label="タイトルにKW" value={stats.titleHasKw + '/' + stats.total} />
        <SummaryRow label="説明文にKW" value={stats.descHasKw + '/' + stats.total} />
      </div>
      {stats.topCreator && stats.topCreator.count > 1 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">トップクリエイター</span>
            <span className="font-bold text-gray-900 text-right max-w-[60%] truncate">{stats.topCreator.name} ({stats.topCreator.count}本)</span>
          </div>
        </div>
      )}
    </div>
  );
}

`;

ed = ed.replace('\nfunction TitlePatternCard(', vidiqComponent + 'function TitlePatternCard(');

// 3l. Update SummaryRow to support highlight prop and 2-col layout
ed = ed.replace(
  `function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
}`,
  `function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}</span>
      <span className={"font-bold " + (highlight ? "text-rose-600" : "text-gray-900")}>{value}</span>
    </div>
  );
}`
);

// 3m. Add CC badge to VideoCard metrics
ed = ed.replace(
  `            <MetricBadge icon={MessageCircle} value={formatNumber(v.commentCount)} color="amber" />
          </div>
        </div>
      </div>
      {hasDesc && (`,
  `            <MetricBadge icon={MessageCircle} value={formatNumber(v.commentCount)} color="amber" />
            {v.hasCaption && <span className="text-[10px] bg-gray-600 text-gray-300 px-1.5 py-0.5 rounded font-semibold">CC</span>}
          </div>
        </div>
      </div>
      {hasDesc && (`
);

fs.writeFileSync(editorPath, ed, 'utf8');
console.log('Editor patched (order selector, vidIQ stats, chart fixes, CC badge)');

console.log('\n=== All v4 patches applied! ===');
