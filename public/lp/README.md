# 静的HTMLページ配置用フォルダ

このフォルダに配置したHTMLファイルは、そのまま公開URLとしてアクセス可能です。

## 使い方

### 1. HTMLファイルの配置

HTMLファイルを `public/lp/` フォルダに配置してください。

例：
- `public/lp/aaa.html` → `https://makers.tokyo/lp/aaa.html`
- `public/lp/bbb.html` → `https://makers.tokyo/lp/bbb.html`

### 2. 画像ファイルの配置

画像は `public/lp/images/` フォルダに配置してください。

例：
- `public/lp/images/header.jpg` → `https://makers.tokyo/lp/images/header.jpg`

### 3. HTMLファイル内でのパス指定

画像などのアセットファイルは、以下のように絶対パスで指定してください：

```html
<!-- 絶対パス（推奨） -->
<img src="/lp/images/header.jpg" alt="ヘッダー画像">

<!-- 相対パス（同じフォルダ構造を保つ場合） -->
<img src="./images/header.jpg" alt="ヘッダー画像">
```

### 4. サブフォルダの作成

複数のキャンペーンやプロジェクトごとにフォルダを分けることもできます：

```
public/
  lp/
    aaa.html
    bbb.html
    images/
      header.jpg
  lp2/
    campaign.html
    images/
      banner.jpg
  campaign2024/
    index.html
```

アクセスURL：
- `https://makers.tokyo/lp/aaa.html`
- `https://makers.tokyo/lp2/campaign.html`
- `https://makers.tokyo/campaign2024/index.html`

## 注意点

1. **即座に公開される**
   - このフォルダに配置したファイルは、デプロイ後すぐに公開されます
   - テスト用ファイルなど、公開したくないファイルは配置しないでください

2. **ファイル名とURL**
   - ファイル名がそのままURLになります
   - 日本語ファイル名は避けてください（エンコードされてしまいます）

3. **HTMLファイルの完全性**
   - 配置するHTMLは完全なHTMLファイル（`<!DOCTYPE html>`から`</html>`まで）である必要があります
   - 外部CSS/JSも同様に `public/lp/` 配下に配置できます

4. **デプロイ**
   - ファイルを追加・変更後、Gitにコミット＆プッシュしてVercelにデプロイしてください
   - デプロイ完了後、URLにアクセスして確認してください

## サンプルファイル構造

```
public/lp/
  ├── aaa.html          # LPページ1
  ├── bbb.html          # LPページ2
  ├── images/           # 画像フォルダ
  │   ├── header.jpg
  │   └── banner.png
  ├── css/              # CSS（必要に応じて）
  │   └── style.css
  └── js/               # JavaScript（必要に応じて）
      └── script.js
```

## トラブルシューティング

### ファイルが見つからない（404エラー）

1. ファイルパスが正しいか確認してください
2. デプロイが完了しているか確認してください
3. ファイル名の大文字小文字を確認してください（URLは大文字小文字を区別します）

### 画像が表示されない

1. 画像のパスが正しいか確認してください（絶対パス `/lp/images/xxx.jpg` を推奨）
2. 画像ファイルが `public/lp/images/` に配置されているか確認してください
3. 画像ファイル名に日本語や特殊文字が含まれていないか確認してください
