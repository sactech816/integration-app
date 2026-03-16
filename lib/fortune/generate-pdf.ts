/**
 * Fortune プレミアムレポート PDF生成 + Supabase Storage保存
 */

import { createClient } from '@supabase/supabase-js';

const BUCKET_NAME = 'fortune-reports';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * HTML → PDF変換（Puppeteer）
 */
export async function htmlToPdf(html: string): Promise<Buffer> {
  let browser = null;
  try {
    let executablePath: string | undefined;
    let args: string[] = [];

    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      const chromium = await import('@sparticuz/chromium-min');
      executablePath = await chromium.default.executablePath(
        'https://github.com/Sparticuz/chromium/releases/download/v143.0.4/chromium-v143.0.4-pack.x64.tar'
      );
      args = chromium.default.args;
    }

    const puppeteer = await import('puppeteer-core');
    browser = await puppeteer.default.launch({
      executablePath,
      args: [
        ...args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
      headless: true,
    });

    const page = await browser.newPage();

    const fullHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Noto Sans JP', sans-serif; margin: 0; padding: 24px; color: #1f2937; }
  @page { margin: 15mm; }
</style>
</head>
<body>${html}</body>
</html>`;

    await page.setContent(fullHtml, { waitUntil: 'networkidle0', timeout: 30000 });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '15mm', left: '10mm' },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * PDFをSupabase Storageにアップロード
 */
export async function uploadPdfToStorage(
  userId: string,
  resultId: string,
  pdfBuffer: Buffer
): Promise<{ storagePath: string; error?: string }> {
  const supabase = getServiceClient();
  if (!supabase) return { storagePath: '', error: 'Supabase not configured' };

  const storagePath = `${userId}/${resultId}.pdf`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (error) {
    console.error('[Fortune PDF] Upload error:', error);
    return { storagePath: '', error: error.message };
  }

  return { storagePath };
}

/**
 * 署名付きURLを生成
 */
export async function getSignedPdfUrl(
  storagePath: string,
  expiresIn = 3600
): Promise<{ url: string; error?: string }> {
  const supabase = getServiceClient();
  if (!supabase) return { url: '', error: 'Supabase not configured' };

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(storagePath, expiresIn);

  if (error || !data?.signedUrl) {
    console.error('[Fortune PDF] Signed URL error:', error);
    return { url: '', error: error?.message || 'URL生成に失敗しました' };
  }

  return { url: data.signedUrl };
}

/**
 * PDF生成 → Storage保存 → DB更新
 */
export async function generateAndStorePdf(
  userId: string,
  resultId: string,
  reportHtml: string
): Promise<{ storagePath: string; error?: string }> {
  try {
    const pdfBuffer = await htmlToPdf(reportHtml);

    const { storagePath, error: uploadError } = await uploadPdfToStorage(userId, resultId, pdfBuffer);
    if (uploadError) return { storagePath: '', error: uploadError };

    const supabase = getServiceClient();
    if (supabase) {
      await supabase
        .from('fortune_results')
        .update({
          pdf_storage_path: storagePath,
          updated_at: new Date().toISOString(),
        })
        .eq('id', resultId)
        .eq('user_id', userId);
    }

    return { storagePath };
  } catch (err: any) {
    console.error('[Fortune PDF] Generation error:', err);
    return { storagePath: '', error: err.message || 'PDF生成に失敗しました' };
  }
}
