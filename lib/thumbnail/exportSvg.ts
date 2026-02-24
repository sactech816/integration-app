/**
 * SVGテキストオーバーレイのエクスポート機能
 * - SVGダウンロード（テキスト編集可能）
 * - PNGダウンロード（完成画像）
 */

const FONT_IMPORT_URL = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=M+PLUS+Rounded+1c:wght@400;700;900&family=Kosugi+Maru&family=Zen+Kaku+Gothic+New:wght@400;700;900&display=swap';

/**
 * 背景画像をbase64データURLに変換（CORS回避用）
 */
async function imageUrlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * SVG要素のクローンを作成し、背景画像をbase64に埋め込む
 */
async function prepareSVGForExport(svgElement: SVGSVGElement): Promise<SVGSVGElement> {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;

  // 背景画像をbase64に変換して埋め込む
  const imageEl = clone.querySelector('image');
  if (imageEl) {
    const href = imageEl.getAttribute('href');
    if (href && href.startsWith('http')) {
      const base64 = await imageUrlToBase64(href);
      imageEl.setAttribute('href', base64);
    }
  }

  // フォントのimportをstyleに追加
  let styleEl = clone.querySelector('defs style');
  if (!styleEl) {
    const defs = clone.querySelector('defs') || clone.insertBefore(
      document.createElementNS('http://www.w3.org/2000/svg', 'defs'),
      clone.firstChild
    );
    styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    defs.appendChild(styleEl);
  }
  if (!styleEl.textContent?.includes(FONT_IMPORT_URL)) {
    styleEl.textContent = `@import url('${FONT_IMPORT_URL}');\n` + (styleEl.textContent || '');
  }

  // 選択枠（破線のrect）を削除
  clone.querySelectorAll('rect[stroke-dasharray]').forEach(el => el.remove());

  return clone;
}

/**
 * SVG文字列としてエクスポート
 */
export async function exportAsSVG(svgElement: SVGSVGElement): Promise<string> {
  const prepared = await prepareSVGForExport(svgElement);
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(prepared);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`;
}

/**
 * SVGをBlobとしてダウンロード
 */
export async function downloadSVG(svgElement: SVGSVGElement, filename: string): Promise<void> {
  const svgString = await exportAsSVG(svgElement);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * PNGとしてエクスポート（Canvas経由）
 */
export async function exportAsPNG(
  svgElement: SVGSVGElement,
  width: number,
  height: number,
): Promise<Blob> {
  const prepared = await prepareSVGForExport(svgElement);
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(prepared);

  // フォントがロードされるのを待つ
  await document.fonts.ready;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      }, 'image/png');
    };
    img.onerror = () => reject(new Error('SVG to Image conversion failed'));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
  });
}

/**
 * PNGをダウンロード
 */
export async function downloadPNG(
  svgElement: SVGSVGElement,
  width: number,
  height: number,
  filename: string,
): Promise<void> {
  const blob = await exportAsPNG(svgElement, width, height);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
