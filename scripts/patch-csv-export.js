const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '..', 'components', 'youtube-keyword-research', 'YouTubeKeywordResearchEditor.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace the exportToCSV function
const oldExport = `  const exportToCSV = () => {
    if (sortedResults.length === 0) return;

    const headers = ['順位', 'タイトル', 'チャンネル名', '再生数', 'チャンネル登録数', '再生倍率', '高評価数', 'コメント数', 'エンゲージメント率(%)', '高評価率(%)', '動画時間', '動画公開日', 'タグ', '動画URL'];

    const rows = sortedResults.map((v, i) => {
      const engRate = v.viewCount > 0 ? (((v.likeCount + v.commentCount) / v.viewCount) * 100).toFixed(2) : '0';
      const likeRate = v.viewCount > 0 ? ((v.likeCount / v.viewCount) * 100).toFixed(2) : '0';
      return [
        i + 1,
        \`"\${v.title.replace(/"/g, '""')}"\`,
        \`"\${v.channelTitle.replace(/"/g, '""')}"\`,
        v.viewCount,
        v.subscriberCount,
        v.viewRatio,
        v.likeCount,
        v.commentCount,
        engRate,
        likeRate,
        formatDuration(v.duration),
        v.publishedAt.split('T')[0],
        \`"\${(v.tags || []).join(', ').replace(/"/g, '""')}"\`,
        \`https://www.youtube.com/watch?v=\${v.videoId}\`,
      ].join(',');
    });

    const bom = '\\uFEFF';
    const csv = bom + headers.join(',') + '\\n' + rows.join('\\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = \`youtube_keyword_\${searchedKeyword}_\${today}.csv\`;
    a.click();
    URL.revokeObjectURL(url);
  };`;

const newExport = `  const exportToCSV = () => {
    if (sortedResults.length === 0) return;

    const today = new Date().toISOString().split('T')[0];

    // 検索条件セクション
    const dateRangeLabel = DATE_RANGE_OPTIONS.find(o => o.value === dateRange)?.label || '指定なし';
    const sortLabel = SORT_OPTIONS.find(o => o.key === sortKey)?.label || sortKey;
    const conditionLines = [
      '# 検索条件',
      \`キーワード,"\${searchedKeyword}"\`,
      \`検索日,\${today}\`,
      \`公開日フィルター,\${dateRangeLabel}\`,
      \`取得件数,\${maxResults}件\`,
      \`並び替え,\${sortLabel}\`,
      \`最低再生倍率,\${minViewRatio > 0 ? minViewRatio + 'x' : '指定なし'}\`,
      \`最大チャンネル登録者数,\${maxSubscribers > 0 ? formatNumber(maxSubscribers) : '指定なし'}\`,
      \`フィルター後件数,\${sortedResults.length}件\`,
      '',
    ];

    const headers = ['順位', 'タイトル', 'チャンネル名', '再生数', 'チャンネル登録数', '再生倍率', '高評価数', 'コメント数', 'エンゲージメント率(%)', '高評価率(%)', '動画時間', '動画公開日', 'タグ', '動画URL'];

    const rows = sortedResults.map((v, i) => {
      const engRate = v.viewCount > 0 ? (((v.likeCount + v.commentCount) / v.viewCount) * 100).toFixed(2) : '0';
      const likeRate = v.viewCount > 0 ? ((v.likeCount / v.viewCount) * 100).toFixed(2) : '0';
      return [
        i + 1,
        \`"\${v.title.replace(/"/g, '""')}"\`,
        \`"\${v.channelTitle.replace(/"/g, '""')}"\`,
        v.viewCount,
        v.subscriberCount,
        v.viewRatio,
        v.likeCount,
        v.commentCount,
        engRate,
        likeRate,
        formatDuration(v.duration),
        v.publishedAt.split('T')[0],
        \`"\${(v.tags || []).join(', ').replace(/"/g, '""')}"\`,
        \`https://www.youtube.com/watch?v=\${v.videoId}\`,
      ].join(',');
    });

    const bom = '\\uFEFF';
    const csv = bom + conditionLines.join('\\n') + headers.join(',') + '\\n' + rows.join('\\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`youtube_keyword_\${searchedKeyword}_\${today}.csv\`;
    a.click();
    URL.revokeObjectURL(url);
  };`;

if (content.includes('const exportToCSV')) {
  content = content.replace(oldExport, newExport);
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('CSV export patched successfully!');
} else {
  console.error('Could not find exportToCSV function to patch');
}
