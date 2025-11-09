# 09. デバッグ時の注意点

**Index**: [README](./README.md) > 09-debugging-tips

## promptfoo viewの活用

### 基本的な使い方

```bash
pnpm eval:ui
```

起動後: http://localhost:15500 でブラウザが開く

### 重要な特性

**promptfoo viewは新しいLLM呼び出しを行わない** - 既存の評価結果を閲覧するのみ

つまり:
```bash
# 1. テスト実行 (LLM呼び出しあり)
pnpm eval:deterministic

# 2. プロンプト修正
vim ../../.claude/skills/bdd/example-mapping/SKILL.md

# 3. promptfoo view (古い結果を表示)
pnpm eval:ui  # 修正は反映されない！

# 4. 再テスト必要
pnpm eval:deterministic  # 新しいLLM呼び出し
```

### promptfoo viewで確認できること

1. **実際の入出力**
   - 変数展開後のプロンプト全文
   - Claudeの生のレスポンス
   - markdown code blockの有無

2. **assertion失敗理由**
   - どのassertionが失敗したか
   - 期待値vs実際の値
   - JavaScript assertionのエラーメッセージ

3. **トークン使用量**
   - プロンプトトークン
   - 完了トークン
   - 合計トークン

4. **実行時間**
   - テストケースごとの所要時間

## ログレベルの調整

### debug mode

```bash
PROMPTFOO_LOG_LEVEL=debug pnpm eval:deterministic
```

出力内容:
- 変数展開後のプロンプト全文
- promptfooの内部処理ログ
- ファイル読み込みパス
- API呼び出し詳細

### 使い分け

```bash
# 通常実行: 結果のみ
pnpm eval:deterministic

# デバッグ: 詳細ログ
PROMPTFOO_LOG_LEVEL=debug pnpm eval:deterministic

# 特定エラーの調査
PROMPTFOO_LOG_LEVEL=debug pnpm eval:deterministic 2>&1 | grep "ENOENT"
```

## よくあるエラーパターン

### 1. ファイルが見つからない

```
ENOENT: no such file or directory, open '.claude/skills/...'
```

デバッグ:
```bash
# promptfooconfig.yamlのディレクトリで
ls ../../.claude/skills/bdd/example-mapping/SKILL.md
```

参考: [07-file-reference-paths.md](./07-file-reference-paths.md)

### 2. JSON.parse失敗

```
SyntaxError: Unexpected token ` in JSON at position 0
```

原因: markdown code blockが含まれている

解決: `extractJSON()`を使用

参考: [05-json-extraction-in-assertions.md](./05-json-extraction-in-assertions.md)

### 3. assertion返り値エラー

```
Custom function must return a boolean, number, or GradingResult object.
Got type undefined
```

原因: `return`文がない

```javascript
// ❌ 間違い
const result = hasStory && hasRules;

// ✅ 正解
return hasStory && hasRules;
```

### 4. 会話形式の出力

期待: JSON
実際: "I'll help you..."

原因: `permission_mode: plan`

解決: permission_modeを削除

参考: [02-permission-mode.md](./02-permission-mode.md)

### 5. ポートが使用中

```
Port 15500 is already in use. Do you have another Promptfoo instance running?
```

解決:
```bash
# 既存のプロセスを確認
lsof -i :15500

# 必要なら停止
kill [PID]

# または別のポート使用
promptfoo view --port 15501
```

## デバッグワークフロー

```
┌─────────────────┐
│ Test Fails      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ promptfoo view  │ ← 実際の出力を確認
└────────┬────────┘
         │
         ▼
   ┌─────┴──────┐
   │ 原因特定   │
   └─────┬──────┘
         │
     ┌───┴────┐
     │        │
     ▼        ▼
┌─────────┐ ┌──────────┐
│ Prompt  │ │ Assertion│
│ 修正    │ │ 修正     │
└────┬────┘ └─────┬────┘
     │            │
     └─────┬──────┘
           │
           ▼
┌─────────────────┐
│ Re-run Test     │ ← pnpm eval:deterministic
└─────────────────┘
```

## promptfoo CLIの有用なコマンド

### eval履歴の表示

```bash
promptfoo list
```

各評価のID、日時、パス率を表示

### 特定のevalを再表示

```bash
promptfoo view eval-ABC-2025-11-08T12:54:13
```

### evalの削除

```bash
promptfoo delete eval-ABC-2025-11-08T12:54:13
```

### 全eval削除 (クリーンアップ)

```bash
promptfoo delete --all
```

## watch modeの活用

### deterministic tests

```bash
pnpm eval:deterministic:watch
```

プロンプトファイルやconfig変更時に自動再実行。

注意: promptfooのwatchは**ファイル変更を監視**するが、promptfoo viewのブラウザは**自動リロードしない**。

ワークフロー:
```
1. watch mode起動
2. プロンプト修正
3. ターミナルで結果確認
4. promptfoo viewをブラウザで手動リロード
```

## まとめ

| ツール/方法 | 用途 | 注意点 |
|------------|------|--------|
| promptfoo view | 詳細分析 | 新規LLM呼び出しなし |
| PROMPTFOO_LOG_LEVEL=debug | 変数展開確認 | 大量のログ |
| watch mode | 反復開発 | ブラウザ手動リロード必要 |
| promptfoo list | eval履歴 | ストレージ管理 |

## 関連する学び

- [01-variable-expansion.md](./01-variable-expansion.md) - debugログで変数展開確認
- [05-json-extraction-in-assertions.md](./05-json-extraction-in-assertions.md) - JSON.parse失敗の対処
- [07-file-reference-paths.md](./07-file-reference-paths.md) - ENOENTエラーの対処
- [08-test-driven-prompt-development.md](./08-test-driven-prompt-development.md) - デバッグサイクル
