'use client';

import Script from 'next/script';

interface TrackingScriptsProps {
  settings?: {
    gtmId?: string;
    fbPixelId?: string;
    lineTagId?: string;
  };
}

/**
 * 外部計測タグ（GTM、Facebook Pixel、LINE Tag）を埋め込むコンポーネント
 */
export function TrackingScripts({ settings }: TrackingScriptsProps) {
  if (!settings) return null;

  return (
    <>
      {/* Google Tag Manager */}
      {settings.gtmId && (
        <>
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${settings.gtmId}');
              `,
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${settings.gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}

      {/* Facebook Pixel */}
      {settings.fbPixelId && (
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${settings.fbPixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}

      {/* LINE Tag */}
      {settings.lineTagId && (
        <Script
          id="line-tag"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(g,d,o){
                g._ltq=g._ltq||[];g._lt=g._lt||function(){g._ltq.push(arguments)};
                var h=d.getElementsByTagName(o)[0];
                var s=d.createElement(o);s.async=1;
                s.src='https://d.line-scdn.net/n/line_tag/public/release/v1/lt.js';
                h.parentNode.insertBefore(s,h);
              })(window,document,'script');
              _lt('init',{customerType:'lap',tagId:'${settings.lineTagId}'});
              _lt('send','pv',['${settings.lineTagId}']);
            `,
          }}
        />
      )}
    </>
  );
}

export default TrackingScripts;











































































































