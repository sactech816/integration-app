import { NextResponse } from 'next/server';
import { 
  getProviderFromAdminSettings, 
  generateWithFallback 
} from '@/lib/ai-provider';
import { getSubscriptionStatus } from '@/lib/subscription';

// レスポンスの型定義
interface TargetSuggestion {
  profile: string;
  merits: string[];
  benefits: string[];
  differentiation: string[];
  usp: string;
}

interface GeneratedTargets {
  targets: TargetSuggestion[];
}

export async function POST(request: Request) {
  try {
    const { title, subtitle, instruction, user_id } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'タイトルを入力してください' },
        { status: 400 }
      );
    }

    // デモモード: APIキーがない、または環境変数でデモモードが有効な場合
    const useMockData = (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) || process.env.USE_MOCK_DATA === 'true';
    
    if (useMockData) {
      // モックデータを返す（デモ・開発用）
      const mockData: GeneratedTargets = {
        targets: [
          {
            profile: '副業を始めたいが何から手をつけていいかわからない30代会社員',
            merits: [
              '具体的なステップが明示されているため、迷わず実践できる',
              '本業との両立を考慮したスケジュール例が豊富',
              '初期費用を抑えた始め方が詳しく解説されている'
            ],
            benefits: [
              '将来への経済的不安が軽減され、家族との時間にも心の余裕が生まれる',
              '自分の可能性を広げることで、仕事へのモチベーションが向上する',
              '新しいスキルを身につけることで自信がつき、キャリアの選択肢が広がる'
            ],
            differentiation: [
              '他書では触れられない「失敗事例」から学べる実践的アドバイス',
              '読者の状況別にカスタマイズできるチェックリスト付き'
            ],
            usp: '「忙しい会社員でも、1日30分の積み重ねで確実に成果を出せる」再現性の高い実践メソッド'
          },
          {
            profile: '育児中で在宅でできる仕事を探している30代〜40代の主婦・主夫',
            merits: [
              'スキマ時間を活用した効率的な作業方法が学べる',
              '特別なスキルがなくても始められる具体例が多数',
              '家事・育児と両立するためのタイムマネジメント術が充実'
            ],
            benefits: [
              '自分自身の収入を得ることで、家計への貢献と自己肯定感が向上する',
              '社会とのつながりを感じられ、孤独感が軽減される',
              '子どもに「働く姿」を見せることで、良いロールモデルになれる'
            ],
            differentiation: [
              '育児中の著者自身の体験に基づくリアルなアドバイス',
              '子どもの年齢別・時間帯別の具体的なスケジュール例'
            ],
            usp: '「子育てしながらでも諦めない」育児と両立できる現実的なロードマップ'
          },
          {
            profile: '定年後のセカンドキャリアを模索している50代〜60代のシニア層',
            merits: [
              'これまでの経験・スキルを活かせる方法が具体的にわかる',
              'デジタルツールの使い方も丁寧に解説されている',
              '年齢を強みに変えるマーケティング戦略が学べる'
            ],
            benefits: [
              '定年後も社会に貢献し続けることで、生きがいを見つけられる',
              '経済的な自立を維持し、家族に負担をかけない安心感を得られる',
              '新しい挑戦を通じて、若々しい気持ちを保てる'
            ],
            differentiation: [
              'シニア向けに特化した事例と成功パターンの紹介',
              '失敗を恐れずに始められる「小さく始める」アプローチ'
            ],
            usp: '「人生経験こそ最大の資産」年齢をハンデにしない、経験者ならではの成功法則'
          }
        ]
      };
      
      return NextResponse.json(mockData);
    }

    if (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'AI APIキーが設定されていません（OPENAI_API_KEY または GEMINI_API_KEY が必要です）' },
        { status: 500 }
      );
    }

    // ユーザーからの追加要望があれば追記
    const instructionAddition = instruction ? `

# ユーザーからの追加修正要望:
${instruction}

上記のリクエストを反映して、再度案を作成してください。` : '';

    const systemPrompt = `＃目的：
本の「タイトル」「サブタイトル」を入力すると、その内容に基づいて典型的な読者像（ターゲットユーザ）を3種類提案してください。
それぞれについて「メリット」「ベネフィット」「差別化要素」「USP」を整理して表示してください。

＃あなたの役割：
ベストセラーを多数プロデュースした経験を持つ出版マーケティングプロデューサー

＃ターゲットユーザ：
Kindle出版を考えている著者、ビジネス書や実用書を作成したい人

＃機能：
- 入力された「タイトル」と「サブタイトル」から想定される読者層を抽出
- 各読者層ごとに、メリット（機能的利点）、ベネフィット（読者が得られる人生的価値）、差別化要素（競合との違い）、USP（独自の強み）を提示
- メリットとベネフィットは最低2つ、必要に応じて3つ以上記載してもよい
- 出力は3種類のターゲットユーザごとに整理して表示

＃条件：
-日本語のみ
-プロフィールは簡潔に（例：副業を始めたい30代会社員）
-メリットは「特徴から得られる利点」として機能的に表現する
-ベネフィットは「読者の生活や感情にどう役立つか」を表現する
-差別化要素は「他書との違い」を明示する
-USPは「この本だからこそ実現できる独自の強み」を端的にまとめる

＃出力形式：
以下のJSON形式で出力してください。必ずJSON形式で返してください。

{
  "targets": [
    {
      "profile": "プロフィール（例：副業を始めたい30代会社員）",
      "merits": ["メリット1", "メリット2", "メリット3"],
      "benefits": ["ベネフィット1", "ベネフィット2", "ベネフィット3"],
      "differentiation": ["差別化要素1", "差別化要素2"],
      "usp": "独自の強み（この本だからこそ実現できる価値）"
    },
    ...
  ]
}

- targets: 3つのターゲットユーザ情報を含む配列
- profile: 簡潔なプロフィール（1文）
- merits: メリットの配列（最低2つ、最大5つ）
- benefits: ベネフィットの配列（最低2つ、最大5つ）
- differentiation: 差別化要素の配列（2つ）
- usp: USP（1文）${instructionAddition}`;

    const userMessage = `以下の本について、典型的な読者像（ターゲットユーザ）を3種類提案してください。

タイトル：${title}
${subtitle ? `サブタイトル：${subtitle}` : ''}`;

    // ユーザーのプランTierを取得
    let planTier = 'none';
    if (user_id) {
      const subscriptionStatus = await getSubscriptionStatus(user_id);
      planTier = subscriptionStatus.planTier;
    }

    // 管理者設定からAIプロバイダーを取得（思考・構成フェーズなので outline）
    const aiSettings = await getProviderFromAdminSettings('kdl', planTier, 'outline');
    
    console.log(`[KDL generate-target] Using model=${aiSettings.model}, backup=${aiSettings.backupModel}, plan=${planTier}`);

    const aiRequest = {
      messages: [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: userMessage },
      ],
      responseFormat: 'json' as const,
      temperature: 0.8,
    };

    // フォールバック付きでAI生成を実行
    const response = await generateWithFallback(
      aiSettings.provider,
      aiSettings.backupProvider,
      aiRequest,
      {
        service: 'kdl',
        phase: 'outline',
        model: aiSettings.model,
        backupModel: aiSettings.backupModel,
      }
    );

    const content = response.content;
    if (!content) {
      throw new Error('AIからの応答が空です');
    }

    const result: GeneratedTargets = JSON.parse(content);

    // バリデーション
    if (!result.targets || !Array.isArray(result.targets)) {
      throw new Error('不正な応答形式です');
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Generate target error:', error);
    return NextResponse.json(
      { error: 'ターゲット生成に失敗しました: ' + (error.message || '不明なエラー') },
      { status: 500 }
    );
  }
}

