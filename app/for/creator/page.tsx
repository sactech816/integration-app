import { Metadata } from 'next';
import CreatorPageClient from './CreatorPageClient';

export const metadata: Metadata = {
  title: 'コンテンツ販売・Kindle著者の方へ｜集客メーカー',
  description: 'コンテンツ販売者・Kindle著者・情報発信者向け。見込み客を育て、商品が売れ続ける仕組みを無料構築。セールスライター・ファネル・メルマガで自動化。',
};

export default function CreatorPage() {
  return <CreatorPageClient />;
}
