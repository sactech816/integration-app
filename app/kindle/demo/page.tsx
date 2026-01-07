'use client';

import React from 'react';
import { EditorLayout } from '@/components/kindle/editor';

// デモ用の型定義
interface Section {
  id: string;
  title: string;
  order_index: number;
  content: string;
}

interface Chapter {
  id: string;
  title: string;
  summary: string | null;
  order_index: number;
  sections: Section[];
}

interface Book {
  id: string;
  title: string;
  subtitle: string | null;
}

interface TargetProfile {
  profile?: string;
  merits?: string[];
  benefits?: string[];
  usp?: string;
}

// デモ用のサンプルデータ
const demoBook: Book = {
  id: 'demo-book',
  title: 'AIで始めるKindle出版入門',
  subtitle: '誰でも簡単に本が書ける時代へ',
};

const demoChapters: Chapter[] = [
  {
    id: 'demo-ch-1',
    title: '第1章　はじめに',
    summary: 'この本の概要と目的',
    order_index: 0,
    sections: [
      { 
        id: 'demo-sec-1-1', 
        title: 'この本の目的', 
        order_index: 0, 
        content: `<h2>この本の目的</h2>
<p>本書は、Kindle出版を始めたいすべての方に向けて書かれました。</p>
<p>従来、本を書くには膨大な時間と労力が必要でした。しかし、AI技術の進歩により、その状況は大きく変わりつつあります。</p>
<h3>本書で学べること</h3>
<ul>
<li>AI執筆ツールの効果的な使い方</li>
<li>魅力的な目次の作り方</li>
<li>読者に響く文章の書き方</li>
<li>KDPでの出版手順</li>
</ul>
<p>さあ、あなたも作家デビューへの第一歩を踏み出しましょう。</p>` 
      },
      { 
        id: 'demo-sec-1-2', 
        title: '対象読者', 
        order_index: 1, 
        content: `<h2>対象読者</h2>
<p>本書は以下のような方を対象としています：</p>
<ul>
<li>本を書いてみたいけど、何から始めればいいかわからない方</li>
<li>文章を書くのが苦手だけど、出版に興味がある方</li>
<li>効率的に執筆を進めたいビジネスパーソン</li>
<li>副業として出版を考えている方</li>
</ul>
<blockquote>
<p>「本を書くのは特別な人だけのもの」という時代は終わりました。</p>
</blockquote>` 
      },
      { 
        id: 'demo-sec-1-3', 
        title: '本書の構成', 
        order_index: 2, 
        content: `<h2>本書の構成</h2>
<p>本書は全3章で構成されています。</p>
<h3>第1章：はじめに</h3>
<p>本書の目的と対象読者について説明します。</p>
<h3>第2章：基本操作</h3>
<p>AI執筆ツールの基本的な使い方を学びます。目次の作成から章・節の管理まで、ステップバイステップで解説します。</p>
<h3>第3章：応用テクニック</h3>
<p>より効率的に執筆を進めるためのテクニックを紹介します。AIアシスタントを最大限に活用する方法も解説します。</p>` 
      },
    ],
  },
  {
    id: 'demo-ch-2',
    title: '第2章　基本操作',
    summary: 'システムの基本的な使い方',
    order_index: 1,
    sections: [
      { 
        id: 'demo-sec-2-1', 
        title: '目次の作成', 
        order_index: 0, 
        content: `<h2>目次の作成</h2>
<p>良い本は、良い目次から始まります。</p>
<p>AI執筆ツールでは、テーマを入力するだけで、売れる本の構成をAIが提案してくれます。</p>
<h3>目次作成の3ステップ</h3>
<ol>
<li><strong>テーマを入力</strong>：書きたい本のテーマを入力します</li>
<li><strong>パターンを選択</strong>：教科書型、Q&A型など、本の構成パターンを選びます</li>
<li><strong>AIが目次を生成</strong>：選んだパターンに基づいて、章・節の構成が自動生成されます</li>
</ol>
<p>生成された目次は自由に編集できます。章や節の並び替え、追加、削除も簡単です。</p>` 
      },
      { 
        id: 'demo-sec-2-2', 
        title: '章と節の管理', 
        order_index: 1, 
        content: `<h2>章と節の管理</h2>
<p>左側のサイドバーから、章と節を自由に管理できます。</p>
<h3>できること</h3>
<ul>
<li>章・節の追加と削除</li>
<li>タイトルの変更</li>
<li>順番の並び替え</li>
<li>章の一括執筆（AI機能）</li>
</ul>
<blockquote>
<p>製品版では、これらの機能がすべて利用可能です。</p>
</blockquote>` 
      },
      { 
        id: 'demo-sec-2-3', 
        title: '執筆エディタの使い方', 
        order_index: 2, 
        content: `<h2>執筆エディタの使い方</h2>
<p>執筆エディタは、Wordのような直感的な操作で文章を編集できます。</p>
<h3>書式設定</h3>
<p>ツールバーから以下の書式が設定できます：</p>
<ul>
<li><strong>見出し</strong>（H1、H2、H3）</li>
<li><strong>太字</strong>・<em>斜体</em>・<s>取り消し線</s></li>
<li>箇条書きリスト</li>
<li>番号付きリスト</li>
<li>引用</li>
<li>水平線</li>
</ul>
<h3>AI執筆機能</h3>
<p>「AI執筆」ボタンをクリックすると、AIがその節の内容を自動生成します。生成されたテキストは、あなたの言葉で自由に編集できます。</p>` 
      },
    ],
  },
  {
    id: 'demo-ch-3',
    title: '第3章　応用テクニック',
    summary: 'より効率的な執筆のために',
    order_index: 2,
    sections: [
      { 
        id: 'demo-sec-3-1', 
        title: '効率的な執筆フロー', 
        order_index: 0, 
        content: `<h2>効率的な執筆フロー</h2>
<p>本を効率的に書き上げるためのワークフローを紹介します。</p>
<h3>推奨フロー</h3>
<ol>
<li><strong>テーマを決める</strong>：何について書くかを明確にする</li>
<li><strong>目次を作成する</strong>：AIの提案を参考に構成を決める</li>
<li><strong>AIで下書きを生成</strong>：各節の下書きをAIに書いてもらう</li>
<li><strong>自分の言葉で編集</strong>：AIの下書きをベースに、自分らしさを加える</li>
<li><strong>全体を見直す</strong>：流れを確認し、必要に応じて調整する</li>
</ol>
<p>このフローを使えば、従来の数分の1の時間で本が書けます。</p>` 
      },
      { 
        id: 'demo-sec-3-2', 
        title: 'AIアシスタントの活用', 
        order_index: 1, 
        content: `<h2>AIアシスタントの活用</h2>
<p>AIは完璧な文章を書くわけではありません。しかし、優秀なアシスタントとして活用できます。</p>
<h3>AIが得意なこと</h3>
<ul>
<li>アイデアの展開</li>
<li>文章の構造化</li>
<li>説明文の作成</li>
<li>リストの整理</li>
</ul>
<h3>人間がすべきこと</h3>
<ul>
<li>独自の視点や経験を加える</li>
<li>読者への語りかけ</li>
<li>最終的な品質チェック</li>
<li>出版前の校正</li>
</ul>
<blockquote>
<p>AIはあくまでアシスタント。最終的な著者はあなたです。</p>
</blockquote>` 
      },
      { 
        id: 'demo-sec-3-3', 
        title: 'まとめ', 
        order_index: 2, 
        content: `<h2>まとめ</h2>
<p>本書では、AI執筆ツールを使ったKindle出版の方法を学びました。</p>
<h3>振り返り</h3>
<ul>
<li>AIを使えば、誰でも効率的に本が書ける</li>
<li>目次作成から執筆まで、すべてのプロセスをサポート</li>
<li>AIの下書きを自分の言葉で仕上げることが大切</li>
</ul>
<h3>次のステップ</h3>
<p>さあ、実際に本を書き始めましょう！</p>
<ol>
<li>無料登録でアカウントを作成</li>
<li>新しい書籍を作成</li>
<li>テーマを入力してAIに目次を提案してもらう</li>
<li>執筆を開始！</li>
</ol>
<p>あなたの本が、世界中の読者に届く日を楽しみにしています。</p>` 
      },
    ],
  },
];

const demoTargetProfile: TargetProfile = {
  profile: 'Kindle出版を始めたい初心者〜中級者',
  merits: ['効率的な執筆方法が学べる', 'AIを活用した執筆ができる', '出版のノウハウが身につく'],
  benefits: ['本の執筆時間を大幅に短縮できる', '出版の夢を実現できる', '副収入を得られる可能性がある'],
  usp: 'AI支援による革新的な執筆体験',
};

export default function KindleDemoPage() {
  // デモモードでは保存処理は何もしない
  const handleUpdateSectionContent = async (_sectionId: string, _content: string) => {
    // 閲覧専用モードなので何もしない
    return;
  };

  return (
    <EditorLayout
      book={demoBook}
      chapters={demoChapters}
      targetProfile={demoTargetProfile}
      tocPatternId="basic"
      onUpdateSectionContent={handleUpdateSectionContent}
      readOnly={true}
    />
  );
}

