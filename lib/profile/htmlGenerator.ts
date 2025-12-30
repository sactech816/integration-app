// プロフィールLPのHTML生成（静的HTMLエクスポート用）
import { Profile, Block } from '@/lib/types';

export const generateProfileHTML = (profile: Profile): string => {
  const gradient = profile.settings?.theme?.gradient || 
    'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)';
  
  const renderBlock = (block: Block): string => {
    switch (block.type) {
      case 'header':
        return `
          <div style="text-align: center; padding: 40px 0;">
            ${block.data.avatar ? `<img src="${block.data.avatar}" alt="${block.data.name}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 4px solid rgba(255,255,255,0.3); margin-bottom: 16px;">` : ''}
            <h1 style="font-size: 24px; font-weight: bold; color: white; margin-bottom: 8px;">${block.data.name}</h1>
            <p style="color: rgba(255,255,255,0.8);">${block.data.title}</p>
          </div>
        `;
      
      case 'text_card':
        return `
          <div style="background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); border-radius: 16px; padding: 24px; margin-bottom: 16px;">
            ${block.data.title ? `<h3 style="font-weight: bold; color: #1f2937; margin-bottom: 12px;">${block.data.title}</h3>` : ''}
            <p style="color: #4b5563; white-space: pre-wrap; ${block.data.align === 'center' ? 'text-align: center;' : ''}">${block.data.text}</p>
          </div>
        `;
      
      case 'image':
        if (!block.data.url) return '';
        return `
          <div style="margin-bottom: 16px;">
            <img src="${block.data.url}" alt="${block.data.caption || ''}" style="width: 100%; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);" />
            ${block.data.caption ? `<p style="text-align: center; color: rgba(255,255,255,0.7); font-size: 14px; margin-top: 8px;">${block.data.caption}</p>` : ''}
          </div>
        `;
      
      case 'youtube':
        const videoId = block.data.url?.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsRes498498|\/watch\?v=))([\w-]{10,12})/)?.[1];
        if (!videoId) return '';
        return `
          <div style="margin-bottom: 16px; aspect-ratio: 16/9; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
            <iframe src="https://www.youtube.com/embed/${videoId}" style="width: 100%; height: 100%; border: none;" allowfullscreen></iframe>
          </div>
        `;
      
      case 'links':
        return block.data.links.map(link => `
          <a href="${link.url}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 16px 24px; background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); border-radius: 12px; font-weight: 500; color: #1f2937; text-decoration: none; margin-bottom: 12px;">
            <span>${link.label}</span>
            <span>→</span>
          </a>
        `).join('');
      
      case 'line_card':
        return `
          <div style="background: #06C755; border-radius: 16px; padding: 24px; margin-bottom: 16px; color: white;">
            <h4 style="font-weight: bold; font-size: 18px; margin-bottom: 8px;">${block.data.title}</h4>
            <p style="opacity: 0.8; font-size: 14px; margin-bottom: 16px;">${block.data.description}</p>
            <a href="${block.data.url}" target="_blank" rel="noopener noreferrer" style="display: block; width: 100%; text-align: center; background: white; color: #06C755; font-weight: bold; padding: 12px; border-radius: 12px; text-decoration: none;">${block.data.buttonText}</a>
          </div>
        `;
      
      case 'quiz':
        return `
          <div style="background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); border-radius: 16px; padding: 24px; margin-bottom: 16px;">
            ${block.data.title ? `<h3 style="font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 16px; text-align: center;">${block.data.title}</h3>` : ''}
            <div style="text-align: center; color: #6b7280; padding: 40px 0;">
              <p>診断クイズは動的コンテンツのため、HTMLエクスポートでは表示されません。</p>
              <p style="margin-top: 8px; font-size: 14px;">公開ページでご確認ください。</p>
            </div>
          </div>
        `;
      
      case 'countdown':
        const targetDate = new Date(block.data.targetDate);
        const now = new Date();
        const difference = targetDate.getTime() - now.getTime();
        const isExpired = difference <= 0;
        
        let countdownHTML = '';
        if (isExpired) {
          countdownHTML = `<p style="color: #6b7280; text-align: center; padding: 20px 0;">${block.data.expiredText || '期限切れ'}</p>`;
        } else {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          
          countdownHTML = `
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 16px;">
              <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border-radius: 12px; padding: 16px; text-align: center;">
                <div style="font-size: 28px; font-weight: 900; color: white;">${days}</div>
                <div style="font-size: 12px; color: rgba(255,255,255,0.8); margin-top: 4px;">日</div>
              </div>
              <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border-radius: 12px; padding: 16px; text-align: center;">
                <div style="font-size: 28px; font-weight: 900; color: white;">${hours}</div>
                <div style="font-size: 12px; color: rgba(255,255,255,0.8); margin-top: 4px;">時間</div>
              </div>
              <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border-radius: 12px; padding: 16px; text-align: center;">
                <div style="font-size: 28px; font-weight: 900; color: white;">${minutes}</div>
                <div style="font-size: 12px; color: rgba(255,255,255,0.8); margin-top: 4px;">分</div>
              </div>
              <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border-radius: 12px; padding: 16px; text-align: center;">
                <div style="font-size: 28px; font-weight: 900; color: white;">${seconds}</div>
                <div style="font-size: 12px; color: rgba(255,255,255,0.8); margin-top: 4px;">秒</div>
              </div>
            </div>
          `;
        }
        
        return `
          <div style="background: ${block.data.backgroundColor || '#f59e0b'}; border-radius: 16px; padding: 24px; margin-bottom: 16px; text-align: center;">
            ${block.data.title ? `<h3 style="font-size: 20px; font-weight: bold; color: white; margin-bottom: 16px;">${block.data.title}</h3>` : ''}
            ${countdownHTML}
          </div>
        `;
      
      case 'gallery':
        if (!block.data.items || block.data.items.length === 0) {
          return `
            <div style="background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); border-radius: 16px; padding: 24px; margin-bottom: 16px; text-align: center; color: #6b7280;">
              画像が設定されていません
            </div>
          `;
        }
        
        const columns = block.data.columns || 3;
        const gridCols = `repeat(${columns}, 1fr)`;
        
        return `
          <div style="margin-bottom: 16px;">
            ${block.data.title ? `<h3 style="font-size: 20px; font-weight: bold; color: white; margin-bottom: 16px; text-align: center;">${block.data.title}</h3>` : ''}
            <div style="display: grid; grid-template-columns: ${gridCols}; gap: 8px;">
              ${block.data.items.map(item => `
                <div style="position: relative; aspect-ratio: 1; border-radius: 12px; overflow: hidden;">
                  <img src="${item.imageUrl}" alt="${item.caption || ''}" style="width: 100%; height: 100%; object-fit: cover;" />
                  ${block.data.showCaptions && item.caption ? `
                    <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); color: white; font-size: 12px; padding: 8px; text-align: center;">
                      ${item.caption}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        `;
      
      default:
        return '';
    }
  };
  
  const blocksHTML = profile.content?.map(renderBlock).join('') || '';
  
  // ヘッダーブロックから名前を取得
  const headerBlock = profile.content?.find(b => b.type === 'header');
  const name = headerBlock && headerBlock.type === 'header' ? headerBlock.data.name : profile.nickname || 'プロフィール';
  
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: ${gradient}; min-height: 100vh; padding: 32px 16px; }
    .container { max-width: 400px; margin: 0 auto; }
    .footer { text-align: center; padding: 32px 0; }
    .footer a { color: rgba(255,255,255,0.6); font-size: 12px; text-decoration: none; }
    .footer a:hover { color: rgba(255,255,255,0.8); }
  </style>
</head>
<body>
  <div class="container">
    ${blocksHTML}
    <div class="footer">
      <a href="/">Powered by コンテンツメーカー</a>
    </div>
  </div>
</body>
</html>`;
};
