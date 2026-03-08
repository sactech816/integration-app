const fs = require('fs');
const path = require('path');

// === 1. Patch API route: add videoDuration param ===
const apiPath = path.resolve(__dirname, '..', 'app', 'api', 'youtube-keyword-research', 'route.ts');
let api = fs.readFileSync(apiPath, 'utf8');

api = api.replace(
  "const { keyword, maxResults = 20, publishedAfter, order = 'relevance' } = body;",
  "const { keyword, maxResults = 20, publishedAfter, order = 'relevance', videoDuration = 'any' } = body;"
);

api = api.replace(
  "      order: ['relevance', 'viewCount', 'date', 'rating'].includes(order) ? order : 'relevance',",
  "      order: ['relevance', 'viewCount', 'date', 'rating'].includes(order) ? order : 'relevance',\n      videoDuration: ['any', 'short', 'medium', 'long'].includes(videoDuration) ? videoDuration : 'any',"
);

fs.writeFileSync(apiPath, api, 'utf8');
console.log('API route patched (videoDuration)');

// === 2. Patch Editor: add videoDuration selector ===
const editorPath = path.resolve(__dirname, '..', 'components', 'youtube-keyword-research', 'YouTubeKeywordResearchEditor.tsx');
let ed = fs.readFileSync(editorPath, 'utf8');

// 2a. Add VideoDuration type
ed = ed.replace(
  "type SearchOrder = 'relevance' | 'viewCount' | 'date' | 'rating';",
  "type SearchOrder = 'relevance' | 'viewCount' | 'date' | 'rating';\ntype VideoDuration = 'any' | 'short' | 'medium' | 'long';"
);

// 2b. Add options constant
ed = ed.replace(
  "const SEARCH_ORDER_OPTIONS:",
  `const VIDEO_DURATION_OPTIONS: { value: VideoDuration; label: string }[] = [
  { value: 'any', label: '混在' },
  { value: 'short', label: 'ショート(4分未満)' },
  { value: 'medium', label: 'ミドル(4-20分)' },
  { value: 'long', label: 'ロング(20分+)' },
];

const SEARCH_ORDER_OPTIONS:`
);

// 2c. Add state
ed = ed.replace(
  "  const [searchOrder, setSearchOrder] = useState<SearchOrder>('relevance');",
  "  const [searchOrder, setSearchOrder] = useState<SearchOrder>('relevance');\n  const [videoDuration, setVideoDuration] = useState<VideoDuration>('any');"
);

// 2d. Send to API
ed = ed.replace(
  "body: JSON.stringify({ keyword: keyword.trim(), maxResults, publishedAfter, order: searchOrder }),",
  "body: JSON.stringify({ keyword: keyword.trim(), maxResults, publishedAfter, order: searchOrder, videoDuration }),"
);

// 2e. Add UI selector - change grid from 3 to 4 cols and add duration selector
ed = ed.replace(
  `              <div className="grid grid-cols-3 gap-3 mt-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">API並び順</label>`,
  `              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">動画タイプ</label>
                  <select value={videoDuration} onChange={(e) => setVideoDuration(e.target.value as VideoDuration)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent">
                    {VIDEO_DURATION_OPTIONS.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">API並び順</label>`
);

fs.writeFileSync(editorPath, ed, 'utf8');
console.log('Editor patched (videoDuration selector)');

console.log('\n=== v5 patches applied! ===');
