/**
 * FAQマッチャー
 * ユーザーの質問をFAQナレッジベースとマッチングし、
 * 一致するものがあればAI呼び出しをスキップして即座に回答する
 */

import { FAQ_ENTRIES, type FAQEntry } from './faq-knowledge';

/** ページパスからカテゴリを推定 */
function getPageCategory(currentPage?: string): string | null {
  if (!currentPage) return null;
  const path = currentPage.toLowerCase();

  if (path.includes('/profile')) return 'profile';
  if (path.includes('/business')) return 'business';
  if (path.includes('/quiz') && !path.includes('/entertainment')) return 'quiz';
  if (path.includes('/entertainment')) return 'quiz';
  if (path.includes('/salesletter')) return 'salesletter';
  if (path.includes('/booking')) return 'booking';
  if (path.includes('/newsletter')) return 'newsletter';
  if (path.includes('/funnel')) return 'funnel';
  if (path.includes('/thumbnail')) return 'thumbnail';
  if (path.includes('/sns-post')) return 'sns-post';
  if (path.includes('/dashboard')) return 'general';
  if (path.includes('/mypage')) return 'plan';
  return null;
}

/** 日本語テキストの正規化: カタカナ→ひらがな変換 */
function katakanaToHiragana(str: string): string {
  return str.replace(/[\u30A1-\u30F6]/g, (match) =>
    String.fromCharCode(match.charCodeAt(0) - 0x60)
  );
}

/** テキスト正規化 */
function normalize(text: string): string {
  return katakanaToHiragana(
    text
      .toLowerCase()
      .replace(/[？！?!。、.,\s]+/g, ' ')
      .trim()
  );
}

/** 助詞・接続詞を除去して意味のある単語だけ残す */
const STOP_WORDS = new Set([
  'の', 'を', 'に', 'は', 'が', 'で', 'と', 'も', 'か', 'な', 'て', 'た',
  'だ', 'です', 'ます', 'ません', 'する', 'した', 'して', 'から', 'まで',
  'より', 'など', 'って', 'という', 'ような', 'けど', 'でも', 'しかし',
  'そして', 'それ', 'これ', 'あの', 'その', 'この', 'どう', 'どの',
  'ください', 'ほしい', 'たい', 'したい', 'について', 'とは',
]);

function extractKeywords(text: string): string[] {
  const normalized = normalize(text);
  // スペース区切り + 2文字以上のN-gramも含める
  const words = normalized.split(/\s+/).filter(w => w.length > 0);

  // 2〜4文字の部分文字列も候補として追加（日本語は分かち書きしないため）
  const substrings: string[] = [];
  const joined = normalized.replace(/\s+/g, '');
  for (let len = 2; len <= Math.min(8, joined.length); len++) {
    for (let i = 0; i <= joined.length - len; i++) {
      substrings.push(joined.substring(i, i + len));
    }
  }

  return [...new Set([...words, ...substrings])].filter(w => !STOP_WORDS.has(w));
}

/**
 * ユーザーの質問をFAQとマッチング
 * @returns マッチしたFAQエントリ、またはnull（AI呼び出しにフォールバック）
 */
export function matchFAQ(userMessage: string, currentPage?: string): FAQEntry | null {
  if (!userMessage || userMessage.trim().length < 2) return null;

  const normalizedMessage = normalize(userMessage);
  const messageKeywords = extractKeywords(userMessage);
  const pageCategory = getPageCategory(currentPage);

  let bestMatch: FAQEntry | null = null;
  let bestScore = 0;

  for (const entry of FAQ_ENTRIES) {
    let score = 0;
    let matchedKeywords = 0;

    // エントリのキーワードとマッチング
    for (const keyword of entry.keywords) {
      const normalizedKeyword = normalize(keyword);

      // 完全一致（正規化後）
      if (normalizedMessage.includes(normalizedKeyword)) {
        matchedKeywords++;
        // 長いキーワードほど高スコア
        score += normalizedKeyword.length >= 4 ? 3 : 2;
      } else {
        // 部分一致: メッセージのキーワードとFAQキーワードの重なり
        for (const mk of messageKeywords) {
          if (normalizedKeyword.includes(mk) || mk.includes(normalizedKeyword)) {
            matchedKeywords++;
            score += 1;
            break;
          }
        }
      }
    }

    if (matchedKeywords === 0) continue;

    // キーワードマッチ率
    const matchRate = matchedKeywords / entry.keywords.length;
    score *= matchRate;

    // ページカテゴリブースト
    if (pageCategory && entry.category === pageCategory) {
      score *= 1.5;
    }

    // 質問文との類似度もチェック
    const normalizedQuestion = normalize(entry.question);
    if (normalizedMessage.includes(normalizedQuestion) || normalizedQuestion.includes(normalizedMessage)) {
      score += 5;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  // 閾値: スコアが2以上でマッチとみなす
  if (bestScore >= 2) {
    return bestMatch;
  }

  return null;
}
