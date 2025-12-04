# YouTube動画グリーンウォッシュ診断ツール（Railway版）

YouTube URLを入力するだけで、動画を自動ダウンロード・分析してグリーンウォッシュ診断を行います。

## 🌟 特徴

- ✅ **YouTube URL完全対応**: URLを貼り付けるだけで自動処理
- ✅ **サーバーサイド処理**: yt-dlp + FFmpegでキーフレーム自動抽出
- ✅ **Claude AI分析**: 環境法の専門家視点で診断
- ✅ **無料デプロイ**: Railwayの無料枠で運用可能

## 🚀 Railwayへのデプロイ手順

### ステップ1: GitHubにプッシュ

```bash
# ファイルを解凍したフォルダで
git init
git add .
git commit -m "Initial commit: YouTube greenwash analyzer"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/リポジトリ名.git
git push -u origin main
```

または**GitHub Desktop**を使用：
1. File → Add Local Repository
2. フォルダを選択
3. 「Create a repository」
4. 「Publish repository」

### ステップ2: Railwayアカウント作成

1. https://railway.app/ にアクセス
2. 「Start a New Project」をクリック
3. GitHubでログイン

### ステップ3: プロジェクトをデプロイ

1. **「New Project」→「Deploy from GitHub repo」**
2. リポジトリを選択
3. 自動的にデプロイ開始！

### ステップ4: ドメイン設定

1. デプロイ完了後、プロジェクトを開く
2. 「Settings」→「Networking」
3. 「Generate Domain」をクリック
4. URLが発行されます（例: `your-app.up.railway.app`）

### ステップ5: 環境変数（オプション）

特に設定不要ですが、Portは自動設定されます。

## 📋 プロジェクト構成

```
greenwash-analyzer-railway/
├── app.py                  # Flaskバックエンド
├── requirements.txt        # Python依存パッケージ
├── Procfile               # 起動コマンド
├── nixpacks.toml          # FFmpegインストール設定
├── build/
│   └── index.html         # フロントエンド
└── README.md
```

## 🔧 ローカルで開発する場合

### 必要な環境
- Python 3.9+
- FFmpeg
- yt-dlp

### セットアップ

```bash
# 仮想環境を作成
python -m venv venv

# 仮想環境を有効化
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 依存パッケージをインストール
pip install -r requirements.txt

# FFmpegとyt-dlpをインストール（まだの場合）
# Windows (Chocolatey):
choco install ffmpeg
pip install yt-dlp

# Mac:
brew install ffmpeg
pip3 install yt-dlp

# サーバーを起動
python app.py
```

http://localhost:5000 でアクセスできます。

## 💡 使用方法

1. デプロイされたURLにアクセス
2. YouTube動画のURLを入力（例: https://www.youtube.com/watch?v=xxxxx）
3. オプション：字幕テキストを入力
4. 「診断を開始」ボタンをクリック
5. 30〜90秒で結果が表示されます

## 🎯 技術スタック

### バックエンド
- Flask (Python)
- yt-dlp (YouTube動画ダウンロード)
- FFmpeg (動画処理・キーフレーム抽出)
- Gunicorn (WSGIサーバー)

### フロントエンド
- Vanilla JavaScript
- Claude API (AI分析)

### ホスティング
- Railway (サーバーサイド実行環境)

## 📊 診断基準

- EU Green Claims Directive
- 日本の景品表示法（優良誤認）
- 消費者庁ガイドライン
- カーボンニュートラル表示の適切性

## ⚠️ 制限事項

- 動画は最初の60秒のみ処理されます
- 年齢制限やプライベート動画は処理できません
- Railwayの無料枠には月間実行時間の制限があります（500時間/月）

## 🔍 トラブルシューティング

### YouTube動画がダウンロードできない

- URLが正しいか確認
- 動画が削除されていないか確認
- 年齢制限がかかっていないか確認

### デプロイに失敗する

- `nixpacks.toml` が正しくコミットされているか確認
- Railwayのログを確認: プロジェクト → Deployments → View Logs

### 分析に時間がかかる

- 動画のダウンロードに30〜60秒
- AI分析に30秒程度
- 合計で最大90秒程度かかることがあります

## 📝 ライセンス

MIT License

## 🤝 サポート

問題が発生した場合は、GitHubのIssuesで報告してください。
