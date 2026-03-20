/**
 * テンプレート背景画像一括生成スクリプト
 *
 * 使い方:
 *   npx tsx scripts/generate-template-images.ts
 *
 * 環境変数:
 *   GEMINI_API_KEY — .env.local から自動読み込み
 *
 * 出力先: public/templates/thumbnail/{templateId}/{themeId}.png
 */

import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// .env.local から読み込み
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// テンプレート定義を直接インポートできないので、ビルド済みを使う代わりに動的に読む
// constants/templates/thumbnail の全テンプレートを手動でマッピング

interface ColorTheme {
  id: string;
  name: string;
  colors: string[];
  promptModifier: string;
}

interface Template {
  id: string;
  name: string;
  promptTemplate: string;
  aspectRatio: string;
  colorThemes: ColorTheme[];
}

// テンプレートデータをインポート
async function loadTemplates(): Promise<Template[]> {
  // tsx は TypeScript をそのまま実行できるので、パスエイリアスなしで直接読む
  const { youtubeImpactTemplates } = await import('../constants/templates/thumbnail/youtube-impact');
  const { youtubeMinimalTemplates } = await import('../constants/templates/thumbnail/youtube-minimal');
  const { youtubePopTemplates } = await import('../constants/templates/thumbnail/youtube-pop');
  const { youtubeProfessionalTemplates } = await import('../constants/templates/thumbnail/youtube-professional');
  const { youtubeEmotionalTemplates } = await import('../constants/templates/thumbnail/youtube-emotional');
  const { instagramPostTemplates } = await import('../constants/templates/thumbnail/instagram-post');
  const { instagramPostExtraTemplates } = await import('../constants/templates/thumbnail/instagram-post-extra');
  const { instagramStoryTemplates } = await import('../constants/templates/thumbnail/instagram-story');
  const { instagramStoryExtraTemplates } = await import('../constants/templates/thumbnail/instagram-story-extra');
  const { twitterTemplates } = await import('../constants/templates/thumbnail/twitter');
  const { threadsTemplates } = await import('../constants/templates/thumbnail/threads');
  const { bannerTemplates } = await import('../constants/templates/thumbnail/banner');
  const { tiktokTemplates } = await import('../constants/templates/thumbnail/tiktok');
  const { noteBlogTemplates } = await import('../constants/templates/thumbnail/note-blog');

  return [
    ...youtubeImpactTemplates,
    ...youtubeMinimalTemplates,
    ...youtubePopTemplates,
    ...youtubeProfessionalTemplates,
    ...youtubeEmotionalTemplates,
    ...instagramPostTemplates,
    ...instagramPostExtraTemplates,
    ...instagramStoryTemplates,
    ...instagramStoryExtraTemplates,
    ...twitterTemplates,
    ...threadsTemplates,
    ...bannerTemplates,
    ...tiktokTemplates,
    ...noteBlogTemplates,
  ];
}

const OUTPUT_DIR = path.resolve(__dirname, '../public/templates/thumbnail');

// レート制限用ディレイ
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateImage(
  ai: GoogleGenAI,
  template: Template,
  theme: ColorTheme,
): Promise<Buffer | null> {
  // 背景のみのプロンプトを構築（テキストなし）
  let prompt = template.promptTemplate;
  prompt = prompt.replace(/\{\{title\}\}/g, '');
  prompt = prompt.replace(/\{\{subtitle\}\}/g, '');
  prompt = prompt.replace(/\{\{colorModifier\}\}/g, theme.promptModifier);

  prompt += '\n\nCRITICAL: Do NOT include ANY text, letters, numbers, words, or characters in this image. This is a BACKGROUND-ONLY template image. Generate only visual design elements, patterns, illustrations, gradients, and color compositions. Absolutely NO text whatsoever. The image should have clear space where text can be overlaid later.';

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-image-generation',
      contents: prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio: template.aspectRatio as '16:9' | '9:16' | '1:1',
          imageSize: '2K',
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) return null;

    const imagePart = parts.find(
      (part: Record<string, unknown>) => part.inlineData && typeof part.inlineData === 'object'
    );

    if (!imagePart?.inlineData?.data) return null;

    return Buffer.from(imagePart.inlineData.data as string, 'base64');
  } catch (error) {
    console.error(`  ❌ エラー: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY が設定されていません (.env.local を確認)');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });
  const templates = await loadTemplates();

  // 総数カウント
  let totalImages = 0;
  for (const t of templates) {
    totalImages += t.colorThemes.length;
  }

  console.log(`\n📦 テンプレート数: ${templates.length}`);
  console.log(`🎨 画像総数: ${totalImages}`);
  console.log(`💰 推定コスト: 約 $${(totalImages * 0.02).toFixed(2)} (≈ ¥${Math.round(totalImages * 0.02 * 150)}) [gemini-2.5-flash]\n`);

  // 既存画像をスキップするかチェック
  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const template of templates) {
    const templateDir = path.join(OUTPUT_DIR, template.id);

    for (const theme of template.colorThemes) {
      const outputPath = path.join(templateDir, `${theme.id}.png`);

      // 既にファイルがあればスキップ
      if (fs.existsSync(outputPath)) {
        console.log(`⏭️  スキップ: ${template.id}/${theme.id} (既存)`);
        skipped++;
        continue;
      }

      console.log(`🎨 生成中: ${template.id}/${theme.id} (${template.name} - ${theme.name})...`);

      // ディレクトリ作成
      fs.mkdirSync(templateDir, { recursive: true });

      const imageBuffer = await generateImage(ai, template, theme);

      if (imageBuffer) {
        fs.writeFileSync(outputPath, imageBuffer);
        generated++;
        console.log(`  ✅ 保存: ${outputPath} (${(imageBuffer.length / 1024).toFixed(0)}KB)`);
      } else {
        failed++;
        console.log(`  ❌ 失敗: ${template.id}/${theme.id}`);
      }

      // レート制限対策: 1.5秒待つ
      await sleep(1500);
    }
  }

  console.log(`\n========== 完了 ==========`);
  console.log(`✅ 生成: ${generated}`);
  console.log(`⏭️  スキップ: ${skipped}`);
  console.log(`❌ 失敗: ${failed}`);
  console.log(`📁 出力先: ${OUTPUT_DIR}`);
}

main().catch(console.error);
