import { Metadata } from 'next';
import ShopPageClient from './ShopPageClient';

export const metadata: Metadata = {
  title: '店舗・教室・サロンの方へ｜集客メーカー',
  description: '店舗・教室・サロンオーナー向け。リピーターが増え、口コミが自然に広がる仕組みを無料構築。診断クイズ・ガチャ・スタンプラリー・予約フォームで楽しい集客を。',
};

export default function ShopPage() {
  return <ShopPageClient />;
}
