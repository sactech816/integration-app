// ビジネスLPのHTML生成（静的HTMLエクスポート用）
import { BusinessLP, Block } from '@/lib/types';

export const generateBusinessHTML = (lp: BusinessLP): string => {
  const renderBlock = (block: Block): string => {
    switch (block.type) {
      case 'hero':
        return `
          <section style="background: ${block.data.backgroundColor || 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'}; color: white; padding: 100px 24px; text-align: center;">
            <div style="max-width: 800px; margin: 0 auto;">
              <h1 style="font-size: 48px; font-weight: 900; margin-bottom: 24px; white-space: pre-line;">${block.data.headline}</h1>
              <p style="font-size: 20px; opacity: 0.9; margin-bottom: 40px;">${block.data.subheadline}</p>
              ${block.data.ctaText ? `<a href="${block.data.ctaUrl || '#'}" style="display: inline-flex; align-items: center; gap: 8px; background: #f59e0b; color: white; font-weight: bold; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-size: 18px;">${block.data.ctaText} →</a>` : ''}
            </div>
          </section>
        `;
      
      case 'features':
        return `
          <section style="background: #f9fafb; padding: 80px 24px;">
            <div style="max-width: 1000px; margin: 0 auto;">
              ${block.data.title ? `<h2 style="font-size: 36px; font-weight: 900; text-align: center; color: #1f2937; margin-bottom: 60px;">${block.data.title}</h2>` : ''}
              <div style="display: grid; grid-template-columns: repeat(${block.data.columns || 3}, 1fr); gap: 32px;">
                ${block.data.items.map(item => `
                  <div style="text-align: center; padding: 24px;">
                    ${item.icon ? `<div style="font-size: 48px; margin-bottom: 16px;">${item.icon}</div>` : ''}
                    <h3 style="font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 12px;">${item.title}</h3>
                    <p style="color: #6b7280;">${item.description}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          </section>
        `;
      
      case 'cta_section':
        return `
          <section style="background: ${block.data.backgroundGradient || block.data.backgroundColor || '#f59e0b'}; color: white; padding: 80px 24px; text-align: center;">
            <div style="max-width: 600px; margin: 0 auto;">
              <h2 style="font-size: 36px; font-weight: 900; margin-bottom: 24px;">${block.data.title}</h2>
              <p style="font-size: 18px; opacity: 0.9; margin-bottom: 40px;">${block.data.description}</p>
              <a href="${block.data.buttonUrl || '#'}" style="display: inline-flex; align-items: center; gap: 8px; background: white; color: #1f2937; font-weight: bold; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-size: 18px;">${block.data.buttonText} →</a>
            </div>
          </section>
        `;
      
      case 'pricing':
        return `
          <section style="background: #f9fafb; padding: 80px 24px;">
            <div style="max-width: 1000px; margin: 0 auto;">
              <h2 style="font-size: 36px; font-weight: 900; text-align: center; color: #1f2937; margin-bottom: 60px;">料金プラン</h2>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
                ${block.data.plans.map(plan => `
                  <div style="background: ${plan.isRecommended ? '#f59e0b' : 'white'}; color: ${plan.isRecommended ? 'white' : '#1f2937'}; border-radius: 16px; padding: 32px; ${plan.isRecommended ? 'transform: scale(1.05);' : ''}">
                    ${plan.isRecommended ? '<span style="display: inline-block; background: white; color: #f59e0b; font-size: 12px; font-weight: bold; padding: 4px 12px; border-radius: 50px; margin-bottom: 16px;">おすすめ</span>' : ''}
                    <h3 style="font-size: 20px; font-weight: bold;">${plan.title}</h3>
                    <p style="font-size: 32px; font-weight: 900; margin: 16px 0;">${plan.price}</p>
                    <ul style="list-style: none; padding: 0;">
                      ${plan.features.map(f => `<li style="padding: 8px 0; font-size: 14px;">✓ ${f}</li>`).join('')}
                    </ul>
                  </div>
                `).join('')}
              </div>
            </div>
          </section>
        `;
      
      case 'faq':
        return `
          <section style="padding: 80px 24px;">
            <div style="max-width: 700px; margin: 0 auto;">
              <h2 style="font-size: 36px; font-weight: 900; text-align: center; color: #1f2937; margin-bottom: 60px;">よくある質問</h2>
              ${block.data.items.map(item => `
                <div style="background: white; border-radius: 12px; margin-bottom: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
                  <div style="padding: 20px; font-weight: 600; color: #1f2937;">Q. ${item.question}</div>
                  <div style="padding: 0 20px 20px; color: #6b7280;">A. ${item.answer}</div>
                </div>
              `).join('')}
            </div>
          </section>
        `;
      
      default:
        return '';
    }
  };
  
  const blocksHTML = lp.content?.map(renderBlock).join('') || '';
  
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${lp.title}</title>
  <meta name="description" content="${lp.description || ''}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; }
    .footer { background: #1f2937; color: #6b7280; padding: 32px; text-align: center; font-size: 12px; }
    .footer a { color: #6b7280; text-decoration: none; }
    .footer a:hover { color: #9ca3af; }
  </style>
</head>
<body>
  ${blocksHTML}
  <footer class="footer">
    <a href="/">Powered by コンテンツメーカー</a>
  </footer>
</body>
</html>`;
};
