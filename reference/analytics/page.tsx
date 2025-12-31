import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Metadata } from 'next';
import { Block, migrateOldContent } from '@/lib/types';
import { BlockRenderer } from '@/components/BlockRenderer';
import { ProfileViewTracker } from '@/components/ProfileViewTracker';
import { TrackingScripts } from '@/components/TrackingScripts';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import Link from 'next/link';

interface BusinessProject {
  id: string;
  slug: string;
  nickname?: string | null;
  content: Block[];
  settings?: {
    gtmId?: string;
    fbPixelId?: string;
    lineTagId?: string;
    theme?: {
      gradient?: string;
      backgroundImage?: string;
    };
  };
}

// サンプルビジネスLPのデータ
const sampleProjects = {
  'sample-business': {
    id: 'sample-business',
    slug: 'sample-business',
    name: 'ビジネス向けサンプル',
    blocks: [
      {
        type: 'header' as const,
        data: {
          avatar: '',
          name: '山田太郎',
          title: '企業の成長を支援するビジネスコンサルタント',
          category: 'business'
        }
      },
      {
        type: 'text_card' as const,
        data: {
          title: '私について',
          text: '15年以上の経験を持つビジネスコンサルタントとして、中小企業の経営課題解決をサポートしています。\n\n戦略立案から実行支援まで、企業の成長を総合的に支援します。',
          align: 'left' as const
        }
      },
      {
        type: 'text_card' as const,
        data: {
          title: '提供サービス',
          text: '• 経営戦略の立案\n• 業務プロセスの改善\n• 組織開発・人材育成\n• マーケティング戦略',
          align: 'left' as const
        }
      },
      {
        type: 'links' as const,
        data: {
          links: [
            { label: '公式サイト', url: 'https://example.com', style: '' },
            { label: 'お問い合わせ', url: 'https://example.com/contact', style: '' },
            { label: 'LinkedIn', url: 'https://linkedin.com/in/example', style: '' }
          ]
        }
      }
    ],
    theme: { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
  },
  'sample-creator': {
    id: 'sample-creator',
    slug: 'sample-creator',
    name: 'クリエイター向けサンプル',
    blocks: [
      {
        type: 'header' as const,
        data: {
          avatar: '',
          name: '佐藤花子',
          title: '心に響くビジュアルを創るイラストレーター',
          category: 'other'
        }
      },
      {
        type: 'text_card' as const,
        data: {
          title: 'About',
          text: 'フリーランスのイラストレーターとして活動しています。\n\n書籍の挿絵、広告イラスト、キャラクターデザインなど、幅広いジャンルで制作を行っています。',
          align: 'center' as const
        }
      },
      {
        type: 'text_card' as const,
        data: {
          title: '得意分野',
          text: '• キャラクターイラスト\n• 水彩タッチのイラスト\n• 書籍の挿絵\n• SNS用アイコン制作',
          align: 'left' as const
        }
      },
      {
        type: 'links' as const,
        data: {
          links: [
            { label: 'ポートフォリオ', url: 'https://example.com', style: '' },
            { label: 'X (Twitter)', url: 'https://x.com/example', style: '' },
            { label: 'Instagram', url: 'https://instagram.com/example', style: '' },
            { label: 'お仕事依頼', url: 'https://example.com/contact', style: '' }
          ]
        }
      }
    ],
    theme: { gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }
  },
  'sample-shop': {
    id: 'sample-shop',
    slug: 'sample-shop',
    name: '店舗向けサンプル',
    blocks: [
      {
        type: 'header' as const,
        data: {
          avatar: '',
          name: 'Cafe Harmony',
          title: '心地よい空間で楽しむ本格コーヒー',
          category: 'other'
        }
      },
      {
        type: 'text_card' as const,
        data: {
          title: 'ようこそ',
          text: '東京・渋谷にある隠れ家的なカフェです。\n\nこだわりの自家焙煎コーヒーと手作りスイーツで、ゆったりとした時間をお過ごしください。',
          align: 'center' as const
        }
      },
      {
        type: 'text_card' as const,
        data: {
          title: '営業時間',
          text: '平日: 10:00 - 20:00\n土日祝: 9:00 - 21:00\n定休日: 毎週火曜日',
          align: 'left' as const
        }
      },
      {
        type: 'links' as const,
        data: {
          links: [
            { label: '公式サイト', url: 'https://example.com', style: '' },
            { label: 'オンライン予約', url: 'https://example.com/reserve', style: '' },
            { label: 'Instagram', url: 'https://instagram.com/example', style: '' },
            { label: 'アクセス', url: 'https://maps.google.com', style: '' }
          ]
        }
      }
    ],
    theme: { gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }
  }
};

// ビジネスプロジェクトデータを取得
async function getBusinessProject(slug: string): Promise<BusinessProject | null> {
  // サンプルビジネスLPの場合
  if (slug in sampleProjects) {
    const sample = sampleProjects[slug as keyof typeof sampleProjects];
    const { generateBlockId } = await import('@/lib/types');
    
    const blocksWithIds = sample.blocks.map(block => ({
      ...block,
      id: generateBlockId()
    }));
    
    return {
      id: sample.id,
      slug: sample.slug,
      content: blocksWithIds as Block[],
      settings: {
        theme: sample.theme
      }
    };
  }
  
  if (!supabase) return null;
  
  // business_projectsテーブルから取得（slugまたはnicknameで検索）
  const { data, error } = await supabase
    .from('business_projects')
    .select('id, slug, nickname, content, settings')
    .or(`slug.eq.${slug},nickname.eq.${slug}`)
    .single();

  if (error || !data) return null;
  return data as BusinessProject;
}

// デモページ用の関数（削除）
async function getDemoProject_OLD(slug: string): Promise<BusinessProject | null> {
  if (slug === 'demo-user') {
    const { templates } = await import('@/constants/templates');
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    // テンプレートのブロックをコピーしてIDを再生成
    const { generateBlockId } = await import('@/lib/types');
    const demoBlocks = randomTemplate.blocks.map(block => ({
      ...block,
      id: generateBlockId()
    })).map(block => {
      if (block.type === 'faq') {
        return {
          ...block,
          data: {
            items: block.data.items.map((item: any) => ({
              ...item,
              id: generateBlockId()
            }))
          }
        };
      } else if (block.type === 'pricing') {
        return {
          ...block,
          data: {
            plans: block.data.plans.map((plan: any) => ({
              ...plan,
              id: generateBlockId()
            }))
          }
        };
      } else if (block.type === 'testimonial') {
        return {
          ...block,
          data: {
            items: block.data.items.map((item: any) => ({
              ...item,
              id: generateBlockId()
            }))
          }
        };
      }
      return block;
    });
    
    return {
      id: 'demo',
      slug: 'demo-user',
      content: demoBlocks,
      settings: {}
    } as BusinessProject;
  }
  return null;
}

// メタデータを生成
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getBusinessProject(slug);
  
  if (!project) {
    return {
      title: 'ビジネスLP',
      description: 'ビジネスランディングページ',
    };
  }
  
  // 後方互換性のため、マイグレーション
  const migratedContent = migrateOldContent(project.content);
  const headerBlock = migratedContent.find((b): b is Extract<Block, { type: 'header' }> => b.type === 'header');
  const name = headerBlock?.data.name || 'ビジネスLP';
  const description = headerBlock?.data.title || 'ビジネスランディングページ';
  const avatar = headerBlock?.data.avatar || null;
  
  // ベースURLを取得（環境変数から、またはデフォルト値）
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lp.makers.tokyo';
  const ogImage = avatar ? avatar : `${baseUrl}/og-image.png`;
  const projectUrl = `${baseUrl}/b/${slug}`;
  
  return {
    title: `${name} - ビジネスLP | ビジネスLPメーカー`,
    description: `${description} | ビジネスLPメーカーで作成されたビジネスランディングページ。`,
    keywords: [
      name,
      'ビジネスLP',
      'ランディングページ',
      'チラシ',
      'ビジネス',
      'ビジネスLPメーカー',
    ],
    authors: [{ name }],
    creator: name,
    publisher: 'ビジネスLPメーカー',
    alternates: {
      canonical: projectUrl,
    },
    openGraph: {
      title: `${name} - ビジネスLP`,
      description,
      url: projectUrl,
      siteName: 'ビジネスLPメーカー',
      locale: 'ja_JP',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} - ビジネスLP`,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}


export default async function BusinessLPPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const project = await getBusinessProject(slug);

  if (!project) {
    notFound();
  }

  // 後方互換性のため、マイグレーション
  const migratedContent = migrateOldContent(project.content);

  // サンプルビジネスLPかどうかを判定
  const isSampleProject = slug.startsWith('sample-');
  
  return (
    <>
      <ProfileViewTracker profileId={project.slug} contentType="business" />
      <TrackingScripts settings={project.settings} />
      
      {/* サンプルビジネスLP選択バー */}
      {isSampleProject && (
        <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-md">
          <div className="container mx-auto max-w-4xl px-4 py-3">
            <p className="text-xs text-gray-600 mb-2 text-center">
              📌 サンプルビジネスLP - クリックして他のサンプルを見る
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              <Link
                href="/b/sample-business"
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  slug === 'sample-business'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ビジネス向け
              </Link>
              <Link
                href="/b/sample-creator"
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  slug === 'sample-creator'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                クリエイター向け
              </Link>
              <Link
                href="/b/sample-shop"
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  slug === 'sample-shop'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                店舗向け
              </Link>
            </div>
          </div>
        </div>
      )}
      
      <div className="w-full">
        <div className="space-y-4 md:space-y-6 lg:space-y-8">
          {migratedContent.map((block, index) => {
            // フル幅判定: hero_fullwidthまたは各ブロックのisFullWidthオプションで判定
            const isFullWidthBlock = 
              block.type === 'hero_fullwidth' || 
              (block.type === 'hero' && block.data.isFullWidth) ||
              (block.type === 'features' && block.data.isFullWidth) ||
              (block.type === 'testimonial' && block.data.isFullWidth) ||
              (block.type === 'problem_cards' && block.data.isFullWidth) ||
              (block.type === 'cta_section' && block.data.isFullWidth) ||
              (block.type === 'dark_section' && block.data.isFullWidth) ||
              (block.type === 'bonus_section' && block.data.isFullWidth) ||
              (block.type === 'checklist_section' && block.data.isFullWidth);
            
            return (
              <div 
                key={block.id || index} 
                className={`${
                  isFullWidthBlock 
                    ? 'w-full' 
                    : 'container mx-auto max-w-full sm:max-w-2xl lg:max-w-4xl px-3 sm:px-4 md:px-6 lg:px-8'
                } ${index > 0 ? `delay-${Math.min(index, 10)}` : ''}`}
              >
                <BlockRenderer block={block} profileId={project.slug} contentType="business" />
              </div>
            );
          })}
        </div>
      </div>
      
      {/* コピーライトとリンク */}
      <footer className="text-center py-6 animate-fade-in delay-10">
        <p className="text-sm text-white/90 drop-shadow-md mb-2">
          &copy; {new Date().getFullYear()} ビジネスLPメーカー. All rights reserved.
        </p>
        <a 
          href="https://lp.makers.tokyo/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-white/80 hover:text-white/100 drop-shadow-md transition-colors underline inline-block mb-2"
        >
          ビジネスLPメーカーで作成
        </a>
        <p className="text-xs text-white/70 drop-shadow-md">
          ビジネスLP・チラシを簡単作成
        </p>
      </footer>

      {/* スクロールトップボタン */}
      <ScrollToTopButton />
    </>
  );
}

