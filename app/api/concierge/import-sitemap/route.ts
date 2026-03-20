/**
 * サイトマップ読み込みAPI
 * POST /api/concierge/import-sitemap
 *
 * サイトマップURLまたは個別URLから各ページのタイトル・説明を取得し、
 * コンシェルジュのナレッジとして使えるサイトページ情報を返す
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

interface SitePage {
  url: string;
  title: string;
  description: string;
}

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'ja-JP,ja;q=0.9',
};

/** サイトマップXMLからURLリストを抽出 */
async function parseSitemap(sitemapUrl: string): Promise<string[]> {
  const res = await fetch(sitemapUrl, {
    headers: FETCH_HEADERS,
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`サイトマップの取得に失敗しました (${res.status})`);

  const xml = await res.text();

  // サイトマップインデックスの場合、子サイトマップを再帰的に取得
  const sitemapIndexUrls = [...xml.matchAll(/<sitemap>[\s\S]*?<loc>(.*?)<\/loc>[\s\S]*?<\/sitemap>/gi)]
    .map(m => m[1].trim());

  if (sitemapIndexUrls.length > 0) {
    const childUrls: string[] = [];
    // 最大3つの子サイトマップを取得（全て取ると大きすぎる可能性）
    for (const childUrl of sitemapIndexUrls.slice(0, 3)) {
      try {
        const urls = await parseSitemap(childUrl);
        childUrls.push(...urls);
      } catch { /* skip */ }
    }
    return childUrls;
  }

  // 通常のサイトマップからURL抽出
  const urls = [...xml.matchAll(/<url>[\s\S]*?<loc>(.*?)<\/loc>[\s\S]*?<\/url>/gi)]
    .map(m => m[1].trim());

  return urls;
}

/** 個別ページからtitle/meta descriptionを取得 */
async function fetchPageMeta(url: string): Promise<SitePage | null> {
  try {
    const res = await fetch(url, {
      headers: FETCH_HEADERS,
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;

    const html = await res.text();

    // <title>を抽出
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    let title = titleMatch
      ? titleMatch[1].replace(/\s+/g, ' ').trim()
      : '';

    // og:title フォールバック
    if (!title) {
      const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
      title = ogTitleMatch ? ogTitleMatch[1].trim() : '';
    }

    // meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
    let description = descMatch ? descMatch[1].trim() : '';

    // og:description フォールバック
    if (!description) {
      const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
      description = ogDescMatch ? ogDescMatch[1].trim() : '';
    }

    if (!title && !description) return null;

    // HTML entities decode
    title = decodeHtmlEntities(title);
    description = decodeHtmlEntities(description);

    // 長すぎる場合は切り詰め
    if (description.length > 200) description = description.substring(0, 200) + '...';

    return { url, title: title || url, description };
  } catch {
    return null;
  }
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { sitemapUrl, pageUrls } = await request.json();

    if (!sitemapUrl && (!pageUrls || pageUrls.length === 0)) {
      return NextResponse.json(
        { error: 'サイトマップURLまたはページURLを入力してください' },
        { status: 400 }
      );
    }

    let urlsToFetch: string[] = [];

    // サイトマップからURL取得
    if (sitemapUrl) {
      try {
        urlsToFetch = await parseSitemap(sitemapUrl);
      } catch (err: any) {
        // サイトマップが見つからない場合、robots.txtを確認
        try {
          const baseUrl = new URL(sitemapUrl).origin;
          const robotsRes = await fetch(`${baseUrl}/robots.txt`, {
            headers: FETCH_HEADERS,
            signal: AbortSignal.timeout(5000),
          });
          if (robotsRes.ok) {
            const robotsTxt = await robotsRes.text();
            const sitemapMatch = robotsTxt.match(/Sitemap:\s*(.+)/i);
            if (sitemapMatch) {
              urlsToFetch = await parseSitemap(sitemapMatch[1].trim());
            }
          }
        } catch { /* ignore */ }

        if (urlsToFetch.length === 0) {
          return NextResponse.json(
            { error: `サイトマップの取得に失敗しました: ${err.message}` },
            { status: 400 }
          );
        }
      }
    }

    // 個別URL追加
    if (pageUrls && pageUrls.length > 0) {
      urlsToFetch = [...urlsToFetch, ...pageUrls];
    }

    // 重複除去 & 最大50ページに制限
    urlsToFetch = [...new Set(urlsToFetch)].slice(0, 50);

    if (urlsToFetch.length === 0) {
      return NextResponse.json(
        { error: 'サイトマップからURLが見つかりませんでした' },
        { status: 400 }
      );
    }

    // 並列でページ情報取得（5件ずつバッチ処理）
    const pages: SitePage[] = [];
    const batchSize = 5;

    for (let i = 0; i < urlsToFetch.length; i += batchSize) {
      const batch = urlsToFetch.slice(i, i + batchSize);
      const results = await Promise.all(batch.map(fetchPageMeta));
      for (const result of results) {
        if (result) pages.push(result);
      }
    }

    return NextResponse.json({
      pages,
      totalUrls: urlsToFetch.length,
      fetchedPages: pages.length,
    });
  } catch (err: any) {
    console.error('Sitemap import error:', err);
    return NextResponse.json(
      { error: err.message || 'サイトマップの読み込みに失敗しました' },
      { status: 500 }
    );
  }
}
