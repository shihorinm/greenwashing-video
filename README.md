# YouTube動画グリーンウォッシュ診断ツール

環境訴求表現のグリーンウォッシュ該当性を診断するWebアプリケーションです。

## 🌐 オンラインデモ

Vercelにデプロイ後、URLがここに表示されます。

## 🚀 Vercelへのデプロイ手順（Windows）

### 前提条件
- GitHubアカウント
- Vercelアカウント（無料）: https://vercel.com/signup

### ステップ1: ファイルをGitHubリポジトリにアップロード

#### 方法A: GitHub Desktopを使用（推奨・簡単）

1. **GitHub Desktopをインストール**
   - https://desktop.github.com/ からダウンロード
   - インストール後、GitHubアカウントでログイン

2. **リポジトリをクローン**
   - GitHub Desktop → File → Clone Repository
   - 作成したリポジトリを選択
   - ローカルのフォルダを指定（例: `C:\Users\YourName\Documents\greenwash-analyzer`）

3. **ファイルをコピー**
   - ダウンロードしたファイルを全てクローンしたフォルダにコピー：
     ```
     greenwash-analyzer/
     ├── pages/
     │   ├── index.js
     │   └── _app.js
     ├── styles/
     │   └── globals.css
     ├── package.json
     ├── next.config.js
     └── .gitignore
     ```

4. **コミット＆プッシュ**
   - GitHub Desktopで変更が表示される
   - 左下に「Initial commit」などとコメントを入力
   - 「Commit to main」ボタンをクリック
   - 「Push origin」ボタンをクリック

#### 方法B: Gitコマンドラインを使用

```bash
# リポジトリをクローン
git clone https://github.com/あなたのユーザー名/リポジトリ名.git
cd リポジトリ名

# ファイルをコピー後

# 変更をコミット
git add .
git commit -m "Initial commit: Greenwash analyzer"
git push origin main
```

### ステップ2: Vercelでデプロイ

1. **Vercelにログイン**
   - https://vercel.com/ にアクセス
   - 「Start Deploying」または「Continue with GitHub」をクリック

2. **リポジトリをインポート**
   - 「Add New...」→「Project」をクリック
   - GitHubから作成したリポジトリを選択
   - 「Import」をクリック

3. **プロジェクト設定**
   - Project Name: そのままでOK
   - Framework Preset: **Next.js** を選択（自動検出される）
   - Root Directory: `.` (デフォルト)
   - Build Command: `npm run build` (デフォルト)
   - Output Directory: `.next` (デフォルト)

4. **デプロイ**
   - 「Deploy」ボタンをクリック
   - 2〜3分待つと完了！

5. **URLを取得**
   - デプロイ完了後、`https://your-project.vercel.app` のようなURLが発行されます
   - このURLを共有すれば、誰でもアクセス可能です！

### ステップ3: 更新する場合

GitHubにプッシュするだけで自動的に再デプロイされます：

```bash
# ファイルを編集後
git add .
git commit -m "Update: 〇〇を修正"
git push origin main
```

## ✨ 機能

- ✅ **動画ファイルアップロード**: MP4, WebM対応
- ✅ **キーフレーム自動抽出**: 5〜8枚を自動抽出
- ✅ **AI分析**: Claude APIによるグリーンウォッシュ診断
- ✅ **リスクレベル表示**: 高・中・低で評価
- ✅ **詳細な改善提案**: 法的リスクと具体的対策

## 📋 使用方法

1. 動画ファイル（60秒以内推奨）をアップロード
2. オプション：字幕テキストを入力
3. 「診断を開始」ボタンをクリック
4. 30〜60秒で結果が表示されます

## 🔧 ローカルで開発する場合

```bash
# 依存パッケージをインストール
npm install

# 開発サーバーを起動
npm run dev
```

http://localhost:3000 でアクセスできます。

## 📊 診断基準

- EU Green Claims Directive
- 日本の景品表示法（優良誤認）
- 消費者庁ガイドライン
- カーボンニュートラル表示の適切性

## 🛠️ 技術スタック

- Next.js 14
- React 18
- Claude API (Sonnet 4)
- Vercel (Hosting)

## 📝 ライセンス

MIT License

## 🤝 サポート

問題が発生した場合は、GitHubのIssuesで報告してください。
