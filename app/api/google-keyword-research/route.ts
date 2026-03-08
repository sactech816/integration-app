import { NextResponse } from 'next/server';

// Google Autocomplete API でサジェストキーワードを取得
async function fetchSuggestions(keyword: string, suffix: string): Promise<string[]> {
  const query = suffix ? `${keyword} ${suffix}` : keyword;
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=ja&q=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!res.ok) return [];
    const data = await res.json();
    // [query, [suggestions...]]
    return Array.isArray(data[1]) ? data[1] : [];
  } catch {
    return [];
  }
}

// Google Custom Search API で allintitle 件数を取得
async function fetchAllintitleCount(keyword: string): Promise<number> {
  const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;

  if (!apiKey || !cx) {
    return -1; // API未設定
  }

  const query = `allintitle:${keyword}`;
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=1`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Custom Search API error:', res.status, errorData);
      return -1;
    }
    const data = await res.json();
    return parseInt(data.searchInformation?.totalResults || '0', 10);
  } catch (error) {
    console.error('Custom Search API fetch error:', error);
    return -1;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { keyword, expansionType = 'alphabet', checkAllintitle = true } = body as {
      keyword: string;
      expansionType?: 'alphabet' | 'hiragana' | 'both' | 'none';
      checkAllintitle?: boolean;
    };

    if (!keyword || keyword.trim().length === 0) {
      return NextResponse.json(
        { error: 'キーワードを入力してください' },
        { status: 400 }
      );
    }

    // 1. サジェストキーワードを展開取得
    const suffixes: { char: string; label: string }[] = [];

    // ベースキーワード（サフィックスなし）
    suffixes.push({ char: '', label: 'base' });

    if (expansionType === 'alphabet' || expansionType === 'both') {
      for (let i = 97; i <= 122; i++) {
        suffixes.push({ char: String.fromCharCode(i), label: String.fromCharCode(i) });
      }
    }

    if (expansionType === 'hiragana' || expansionType === 'both') {
      const hiragana = ['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ', 'さ', 'し', 'す', 'せ', 'そ', 'た', 'ち', 'つ', 'て', 'と', 'な', 'に', 'ぬ', 'ね', 'の', 'は', 'ひ', 'ふ', 'へ', 'ほ', 'ま', 'み', 'む', 'め', 'も', 'や', 'ゆ', 'よ', 'ら', 'り', 'る', 'れ', 'ろ', 'わ'];
      for (const h of hiragana) {
        suffixes.push({ char: h, label: h });
      }
    }

    // 並列でサジェスト取得（5つずつバッチ処理でレート制限回避）
    const allSuggestions: { keyword: string; source: string }[] = [];
    const seen = new Set<string>();

    const batchSize = 5;
    for (let i = 0; i < suffixes.length; i += batchSize) {
      const batch = suffixes.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(async ({ char, label }) => {
          const suggestions = await fetchSuggestions(keyword, char);
          return suggestions.map((s) => ({ keyword: s, source: label }));
        })
      );

      for (const result of results) {
        for (const item of result) {
          const normalized = item.keyword.toLowerCase().trim();
          if (!seen.has(normalized)) {
            seen.add(normalized);
            allSuggestions.push(item);
          }
        }
      }
    }

    // 2. allintitle件数を取得（オプション）
    if (checkAllintitle) {
      const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
      const cx = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;

      if (!apiKey || !cx) {
        // API未設定の場合はサジェストのみ返す
        return NextResponse.json({
          data: allSuggestions.map((s) => ({
            keyword: s.keyword,
            allintitleCount: -1,
            source: s.source,
          })),
          keyword,
          totalSuggestions: allSuggestions.length,
          allintitleAvailable: false,
          message: 'Google Custom Search APIが未設定のため、allintitle件数は取得できません',
        });
      }

      // allintitle件数を取得（バッチ処理、最大50キーワード）
      const keywordsToCheck = allSuggestions.slice(0, 50);
      const allintitleBatchSize = 3; // APIレート制限考慮

      const results: { keyword: string; allintitleCount: number; source: string }[] = [];

      for (let i = 0; i < keywordsToCheck.length; i += allintitleBatchSize) {
        const batch = keywordsToCheck.slice(i, i + allintitleBatchSize);
        const counts = await Promise.all(
          batch.map(async (item) => {
            const count = await fetchAllintitleCount(item.keyword);
            return { ...item, allintitleCount: count };
          })
        );
        results.push(...counts);

        // レート制限：バッチ間に少し待機
        if (i + allintitleBatchSize < keywordsToCheck.length) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }

      // 残りのキーワード（allintitle未チェック）
      const remaining = allSuggestions.slice(50).map((s) => ({
        ...s,
        allintitleCount: -1,
      }));

      return NextResponse.json({
        data: [...results, ...remaining],
        keyword,
        totalSuggestions: allSuggestions.length,
        checkedCount: keywordsToCheck.length,
        allintitleAvailable: true,
      });
    }

    // allintitleチェックなしの場合
    return NextResponse.json({
      data: allSuggestions.map((s) => ({
        keyword: s.keyword,
        allintitleCount: -1,
        source: s.source,
      })),
      keyword,
      totalSuggestions: allSuggestions.length,
      allintitleAvailable: false,
    });
  } catch (error) {
    console.error('Google keyword research error:', error);
    return NextResponse.json(
      { error: 'キーワードリサーチ中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
