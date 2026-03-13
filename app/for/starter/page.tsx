import { Metadata } from 'next';
import StarterPageClient from './StarterPageClient';

export const metadata: Metadata = {
  title: 'これから起業する方へ｜集客メーカー',
  description: '起業準備中・副業を始めたい方向け。何から始めればいいか分からない…を解決。プロフィールLP・診断クイズ・SNS投稿で「あなたを知ってもらう仕組み」をテンプレートから簡単作成。',
};

export default function StarterPage() {
  return <StarterPageClient />;
}
