# ダッシュボードアナリティクス仕様書

## 概要

ダッシュボードのアナリティクス機能は、ユーザーが作成した診断クイズのパフォーマンスを可視化し、分析するための機能です。

## 関連ファイル

### 主要ファイル
- `components/Dashboard.jsx` - ダッシュボードコンポーネント（アナリティクス機能を含む）
- `app/dashboard/page.jsx` - ダッシュボードページのラッパー

### 使用ライブラリ
- `recharts` - グラフ描画ライブラリ（BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer）

## 機能仕様

### 1. 表示モード

アナリティクスセクションには2つの表示モードがあります：

#### 1.1 グラフ表示モード
- 棒グラフで各クイズの指標を可視化
- 3つの指標を同時に表示：
  - 閲覧数（青色 `#6366f1`）
  - 完了数（オレンジ色 `#f59e0b`）
  - クリック数（緑色 `#10b981`）
- X軸：クイズタイトル（10文字以上は省略）
- Y軸：数値
- グラフの切り替えボタン：`BarChart2`アイコン

#### 1.2 テーブル表示モード
- 詳細な数値をテーブル形式で表示
- 各クイズごとに以下の列を表示：
  - タイトル
  - 閲覧数
  - 完了数
  - 完了率（%）
  - クリック数
  - CTR（%）
- テーブルの切り替えボタン：`Table`アイコン

### 2. 計測指標

#### 2.1 基本指標

| 指標名 | データベースカラム | 説明 |
|--------|-------------------|------|
| 閲覧数 | `views_count` | クイズが閲覧された回数 |
| 完了数 | `completions_count` | クイズが完了された回数 |
| クリック数 | `clicks_count` | 結果画面でのクリック回数 |

#### 2.2 計算指標

| 指標名 | 計算式 | 説明 |
|--------|--------|------|
| 完了率 | `(完了数 / 閲覧数) * 100` | 閲覧したユーザーのうち、完了した割合 |
| CTR | `(クリック数 / 完了数) * 100` | 完了したユーザーのうち、クリックした割合 |

**計算ロジック（Dashboard.jsx 576-577行目）:**
```javascript
const rate = q.views_count > 0 ? Math.round((q.completions_count||0)/q.views_count*100) : 0;
const ctr = q.completions_count > 0 ? Math.round((q.clicks_count||0)/q.completions_count*100) : 0;
```

### 3. 統計サマリー

ダッシュボードの左側に表示される統計情報：

#### 3.1 ユーザー情報カード
- **作成数**: ユーザーが作成したクイズの総数
  - 表示位置: 左上のカード
  - データソース: `myQuizzes.length`
  - 色: インディゴ（`text-indigo-600`）

- **総PV数**: すべてのクイズの閲覧数の合計
  - 表示位置: 右上のカード
  - 計算式: `myQuizzes.reduce((acc, q) => acc + (q.views_count||0), 0)`
  - 色: 緑（`text-green-600`）

### 4. データ取得

#### 4.1 クイズデータの取得
- **通常ユーザー**: 自分のクイズのみ取得
  ```javascript
  supabase.from('quizzes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  ```

- **管理者**: すべてのクイズを取得
  ```javascript
  supabase.from('quizzes')
    .select('*')
    .order('created_at', { ascending: false })
  ```

#### 4.2 グラフデータの変換
```javascript
const graphData = myQuizzes.map(q => ({
    name: q.title.length > 10 ? q.title.substring(0, 10)+'...' : q.title,
    views: q.views_count || 0,
    completions: q.completions_count || 0,
    clicks: q.clicks_count || 0
}));
```

### 5. UI/UX仕様

#### 5.1 レイアウト
- **セクションタイトル**: 「アクセス解析」（`Trophy`アイコン付き）
- **ビューモード切り替え**: 右上にグラフ/テーブル切り替えボタン
- **データなし時の表示**: 「データがありません」メッセージ

#### 5.2 グラフ表示の詳細
- **高さ**: 256px（`h-64`）
- **レスポンシブ**: `ResponsiveContainer`で自動調整
- **X軸ラベル**: 30度回転（`angle={-30}`）
- **グリッド**: 縦線なし、横線のみ（`vertical={false}`）
- **角丸**: 上側のみ4px（`radius={[4, 4, 0, 0]}`）

#### 5.3 テーブル表示の詳細
- **スクロール**: 最大高さ400px、縦横スクロール可能
- **ヘッダー**: 固定表示（`sticky top-0`）
- **完了率**: オレンジ色で強調表示（`text-orange-600 font-bold`）
- **CTR**: 緑色で強調表示（`text-green-600 font-bold`）
- **タイトル**: 最大幅150px、長い場合は省略（`truncate max-w-[150px]`）

### 6. データ更新タイミング

- **初期表示時**: コンポーネントマウント時（`useEffect`）
- **クイズ削除後**: 削除処理完了後に再取得（`handleDeleteWithRefresh`）
- **クイズ作成後**: エディタからダッシュボードに戻った際に再取得

### 7. エラーハンドリング

- **データなし**: 空の配列の場合、「データがありません」を表示
- **数値が未定義**: `|| 0`でデフォルト値0を設定
- **ゼロ除算**: 完了率とCTRの計算で分母が0の場合は0を返す

## 実装コードの主要部分

### グラフデータの生成（409-414行目）
```409:414:components/Dashboard.jsx
const graphData = myQuizzes.map(q => ({
    name: q.title.length > 10 ? q.title.substring(0, 10)+'...' : q.title,
    views: q.views_count || 0,
    completions: q.completions_count || 0,
    clicks: q.clicks_count || 0
}));
```

### グラフ表示（546-560行目）
```546:560:components/Dashboard.jsx
<div className="h-64">
    <ResponsiveContainer width="100%" height="100%">
        <BarChart data={graphData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{fontSize: 10}} height={50} interval={0} angle={-30} textAnchor="end"/>
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="views" name="閲覧数" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="completions" name="完了数" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="clicks" name="クリック" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
    </ResponsiveContainer>
</div>
```

### テーブル表示（562-591行目）
```562:591:components/Dashboard.jsx
<div className="overflow-x-auto max-h-[400px] overflow-y-auto">
    <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
            <tr>
                <th className="px-4 py-3 bg-gray-50">タイトル</th>
                <th className="px-4 py-3 text-right bg-gray-50">閲覧数</th>
                <th className="px-4 py-3 text-right bg-gray-50">完了数</th>
                <th className="px-4 py-3 text-right bg-gray-50">完了率</th>
                <th className="px-4 py-3 text-right bg-gray-50">クリック</th>
                <th className="px-4 py-3 text-right bg-gray-50">CTR</th>
            </tr>
        </thead>
        <tbody>
            {myQuizzes.map(q => {
                const rate = q.views_count > 0 ? Math.round((q.completions_count||0)/q.views_count*100) : 0;
                const ctr = q.completions_count > 0 ? Math.round((q.clicks_count||0)/q.completions_count*100) : 0;
                return (
                    <tr key={q.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[150px]">{q.title}</td>
                        <td className="px-4 py-3 text-right">{q.views_count||0}</td>
                        <td className="px-4 py-3 text-right">{q.completions_count||0}</td>
                        <td className="px-4 py-3 text-right text-orange-600 font-bold">{rate}%</td>
                        <td className="px-4 py-3 text-right">{q.clicks_count||0}</td>
                        <td className="px-4 py-3 text-right text-green-600 font-bold">{ctr}%</td>
                    </tr>
                );
            })}
        </tbody>
    </table>
</div>
```

### 統計サマリー（506-517行目）
```506:517:components/Dashboard.jsx
<div className="grid grid-cols-2 gap-4 text-center">
    <div className="bg-gray-50 p-3 rounded-lg">
        <div className="text-2xl font-extrabold text-indigo-600">{myQuizzes.length}</div>
        <div className="text-xs text-gray-500 font-bold">作成数</div>
    </div>
    <div className="bg-gray-50 p-3 rounded-lg">
        <div className="text-2xl font-extrabold text-green-600">
            {myQuizzes.reduce((acc, q) => acc + (q.views_count||0), 0)}
        </div>
        <div className="text-xs text-gray-500 font-bold">総PV数</div>
    </div>
</div>
```

## データベーススキーマ

### quizzesテーブル
以下のカラムがアナリティクス機能で使用されます：

- `id` - クイズID
- `user_id` - 作成者ID
- `title` - クイズタイトル
- `views_count` - 閲覧数（整数、デフォルト0）
- `completions_count` - 完了数（整数、デフォルト0）
- `clicks_count` - クリック数（整数、デフォルト0）
- `created_at` - 作成日時

## 今後の拡張可能性

1. **期間フィルタリング**: 日付範囲でデータを絞り込む
2. **エクスポート機能**: CSV/Excel形式でデータをダウンロード
3. **トレンド分析**: 時系列グラフの追加
4. **比較機能**: 複数のクイズを比較
5. **詳細分析**: 個別クイズの詳細ページ
6. **リアルタイム更新**: WebSocketを使用したリアルタイム統計更新

## 注意事項

- カウンターの更新は、クイズプレイヤー側（`app/page.jsx`や`components/QuizPlayer.jsx`）で実装されている必要があります
- 管理者は全ユーザーのクイズデータを閲覧できます
- 数値が未定義の場合は0として扱われます
- 完了率とCTRは整数に丸められます（`Math.round`）


