# promptfoo + Claude Agent SDK: Learnings

promptfoo + Claude Agent SDKのテスト開発で得た知見集。**問題に遭遇したら、まずここを参照**。

## Quick Reference

| # | Topic | 概要 |
|---|-------|------|
| 01 | [Variable Expansion](./01-variable-expansion.md) | `{{vars}}`はNunjucksで自動展開される |
| 02 | [Permission Mode](./02-permission-mode.md) | `permission_mode: plan`はJSON出力を妨げる |
| 03 | [Prompt Design](./03-prompt-design-principles.md) | 重要な指示は冒頭、知識は後続セクション |
| 04 | [JSON Output](./04-forcing-json-output.md) | "ONLY valid JSON (no markdown, no commentary)" |
| 05 | [JSON Extraction](./05-json-extraction-in-assertions.md) | 必ず`extractJSON()`を使用 |
| 06 | [Knowledge Preservation](./06-preserving-prompt-knowledge.md) | 出力形式と知識は両立できる |
| 07 | [File Paths](./07-file-reference-paths.md) | promptfooconfig.yamlが基準 |
| 08 | [TDPD](./08-test-driven-prompt-development.md) | Test-Driven Prompt Development |
| 09 | [Debugging](./09-debugging-tips.md) | `promptfoo view` + `PROMPTFOO_LOG_LEVEL=debug` |
| 10 | [Anti-patterns](./10-anti-patterns.md) | 避けるべき10個のパターン |

## Essential Workflow

```bash
# 1. テストケース定義
vim test-deterministic/promptfooconfig.yaml

# 2. プロンプト作成/修正
vim ../../.claude/skills/bdd/example-mapping/SKILL.md

# 3. テスト実行
pnpm eval:deterministic

# 4. 失敗分析
pnpm eval:ui

# 5. 反復 (2に戻る)
```

## Common Errors & Solutions

| Error | Solution | Reference |
|-------|----------|-----------|
| 会話形式の出力 | `permission_mode`削除 | [02](./02-permission-mode.md) |
| `ENOENT: file not found` | 相対パス確認 | [07](./07-file-reference-paths.md) |
| `SyntaxError` (JSON.parse) | `extractJSON()`使用 | [05](./05-json-extraction-in-assertions.md) |
| `undefined` (assertion) | `return`文追加 | [10](./10-anti-patterns.md) |

## Golden Rules

1. **promptfooはNunjucksで変数展開** - `{{vars}}`は自動置換
2. **file://参照を使う** - config内に直接プロンプト記述しない
3. **重要な指示は冒頭** - JSON出力指示を最初に
4. **extractJSON()を常用** - markdown code block対応
5. **permission_modeに注意** - deterministic testでは不要

## Usage Guide

### 問題に遭遇したとき

1. このCLAUDE.mdのQuick Referenceで該当トピック検索
2. 詳細ファイルを参照 (例: `01-variable-expansion.md`)
3. Common Errors & Solutionsで類似エラー確認

### 新たな学びを追加

**既存ファイルに追加**:
```bash
# assertion関連なら
vim 05-json-extraction-in-assertions.md

# アンチパターンなら
vim 10-anti-patterns.md
```

**新規ファイル作成**:
```bash
# 1. ファイル作成 (連番で)
vim 11-new-topic.md

# 2. テンプレート
# 11. [Topic]
# **Index**: [CLAUDE.md](./CLAUDE.md) > 11-new-topic
# ## 問題 / ## 解決策 / ## 関連する学び

# 3. このCLAUDE.mdのQuick Referenceに追加
```

**メンテナンス原則**: 実例ベース、Before/After対比、簡潔に

## Context

- **作成**: 2025-11-08
- **タスク**: SKILL.mdのpromptfooテスト化
- **結果**: 100% pass (3/3 test cases)

---

promptfoo: https://www.promptfoo.dev/docs/
