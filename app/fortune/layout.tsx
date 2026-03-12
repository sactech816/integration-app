import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '生年月日占い - 九星気学・数秘術・四柱推命 | 集客メーカー',
  description: '生年月日から九星気学・数秘術・四柱推命の3つの占術で総合鑑定。本命星・月命星・ライフパスナンバー・日干を無料で診断できます。',
  openGraph: {
    title: '生年月日占い - 九星気学・数秘術・四柱推命',
    description: '生年月日から3つの占術で総合鑑定。あなたの本質と運勢を無料診断。',
    type: 'website',
  },
};

export default function FortuneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
