# promptfoo Eval ハーネス

Claude Agent 固定の promptfoo 構成を置くためのディレクトリです。pnpm を前提にしており、2層の評価レイヤーで構成されています。

## ディレクトリ構成

```
eval/
├── test-deterministic/     # 決定論的評価（構造化JSON）
│   ├── promptfooconfig.yaml
│   ├── prompts/
│   └── sandbox/
├── test-qualitative/       # 定性的評価（LLM-as-judge）
│   ├── promptfooconfig.yaml
│   ├── prompts/
│   └── sandbox/
├── package.json
└── .env.local
```

## 評価レイヤー

### test-deterministic（決定論的テスト）
- **目的**: Unit testに類似した構造化検証
- **手法**: JSON出力 + contains/javascript assertions
- **用途**: スキーマ検証、必須フィールド確認、値の型チェック
- **例**: セキュリティ脆弱性検出、コード解析結果の構造検証

### test-qualitative（定性的テスト）
- **目的**: 質的評価（ヘルプフルネス、正確性、推論品質）
- **手法**: LLM-as-judge（llm-rubric assertions）
- **用途**: 説明の明瞭さ、技術的正確性、構成の質
- **例**: 技術解説の品質評価、ドキュメント生成の適切性

## 前提
- pnpm 10.x（`package.json` の `packageManager` で `pnpm@10.20.0` をピン留め済み）
- Claude Agent SDK が利用できる Anthropic API key

## セットアップ
1. 依存インストール: `pnpm install`
2. ネイティブビルドの許可: `pnpm approve-builds` を実行し、少なくとも `better-sqlite3` を選択（必要に応じて他のパッケージも許可）。
3. 環境変数テンプレートをコピーし、Anthropic のキーを設定:
   ```bash
   cp .env.example .env
   export $(grep -v '^#' .env | xargs) # もしくは direnv 等を利用
   ```
   eval 実行前に `ANTHROPIC_API_KEY` がシェル上で参照できることを確認してください。

## eval 実行

### 全体実行
- `pnpm eval` - 決定論的 + 定性的テストを順次実行

### 決定論的テスト
- `pnpm eval:deterministic` - 単発実行
- `pnpm eval:deterministic:watch` - ファイル変更監視モード

### 定性的テスト
- `pnpm eval:qualitative` - 単発実行
- `pnpm eval:qualitative:watch` - ファイル変更監視モード

### 結果表示
- `pnpm eval:ui` - ブラウザで結果表示（追加のLLM呼び出しなし）

## 新規テスト追加

### 決定論的テストの追加
1. `test-deterministic/prompts/` にプロンプトファイル作成（JSON出力を強制）
2. `test-deterministic/promptfooconfig.yaml` に `prompts` と `tests` を追加
3. `assert` に `contains`, `is-json`, `javascript` を使用

### 定性的テストの追加
1. `test-qualitative/prompts/` にプロンプトファイル作成（自然言語出力OK）
2. `test-qualitative/promptfooconfig.yaml` に `prompts` と `tests` を追加
3. `assert` に `llm-rubric` を使用して評価基準を記述
