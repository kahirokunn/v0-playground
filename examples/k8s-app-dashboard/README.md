# k8s-app-dashboard

Kubernetesアプリケーションダッシュボード

## 概要

このプロジェクトは、Kubernetesクラスター上で実行されているアプリケーションを監視・管理するためのダッシュボードです。Next.jsで構築されています。

## 開発環境のセットアップ

```bash
# 依存関係のインストール
pnpm install

# 開発サーバーの起動
pnpm dev
```

## ビルド

```bash
# プロダクションビルド
pnpm build

# ビルド後の起動
pnpm start
```

## Dockerイメージのビルド

ローカルでDockerイメージをビルドする場合は、以下のコマンドを実行します：

```bash
# シングルアーキテクチャ（ローカル環境用）
docker build -t quay.io/kahirokunn/k8s-app-dashboard:local .

# マルチアーキテクチャ（amd64とarm64）
docker buildx create --name mybuilder --use
docker buildx build --platform linux/amd64,linux/arm64 -t quay.io/kahirokunn/k8s-app-dashboard:local --push .
```

## CI/CD

このプロジェクトはGitHub Actionsを使用して自動的にDockerイメージをビルドし、Quay.ioにプッシュします。
mainブランチへのプッシュ時、または手動トリガー時にワークフローが実行されます。

ビルドされたイメージは以下のURLで公開されています：

- <https://quay.io/repository/kahirokunn/k8s-app-dashboard>

## 環境変数

アプリケーションで使用する環境変数は`.env.local`ファイルで設定できます：

```
# 例
API_URL=http://api.example.com
```
