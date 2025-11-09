# 03. プロンプト設計の原則

**Index**: [README](./README.md) > 03-prompt-design-principles

## 問題

最初、以下のような複雑なアプローチを試した:

1. **ファイル末尾にJSON出力モードを配置**
2. **条件分岐で出力形式を切り替え**
3. **promptfooconfig.yamlに直接プロンプトを記述**

結果: どれも失敗または非効率

## 原則1: 重要な指示は冒頭に

### ❌ 間違い: ファイル末尾に配置

```markdown
# Example Mapping Skill

[対話型ガイダンス 200行]

## Structured Output Mode
User Story: {{story_input}}
Output JSON...
```

問題: Claudeが先に応答を開始してしまう

### ✅ 正解: ファイル冒頭に配置

```markdown
# Example Mapping Skill

User Story: {{story_input}}

Analyze the above user story and output ONLY valid JSON:

[JSON schema]

## Principles
[ドメイン知識]
```

## 原則2: 単一責任原則

プロンプトファイルは一つの明確な目的を持つべき。

### ❌ 間違い: 複数モードの混在

```markdown
{% if story_input %}
  [JSON mode]
{% else %}
  [Interactive mode]
{% endif %}
```

問題:
- 複雑性が増す
- promptfooでは常に変数が展開される
- メンテナンスが困難

### ✅ 正解: 目的ごとに分離

- **SKILL.md**: JSON出力専用
- **別ファイル**: 対話型セッション用（必要なら）

## 原則3: `file://`参照を使用

### ❌ 間違い: promptfooconfig.yamlに直接記述

```yaml
prompts:
  - |
    You are Claude Agent performing BDD Example Mapping...

    User Story: {{story_input}}

    [50行のプロンプト]
```

問題:
- 再利用性ゼロ
- バージョン管理が困難
- promptfooconfig.yamlが肥大化

### ✅ 正解: 外部ファイル参照

```yaml
prompts:
  - file://../../.claude/skills/bdd/example-mapping/SKILL.md
```

利点:
- プロンプトのバージョン管理
- 複数のテスト設定で再利用可能
- IDE support (syntax highlighting, linting)

## 原則4: シンプルさと明確さ

### 構造化の黄金律

```markdown
# Skill Name

[変数と出力形式の指示]

[JSON schema]

## Domain Knowledge
[必要な知識とコンテキスト]
```

### なぜこの順序か

1. **タイトル**: 何をするスキルか
2. **変数参照**: コンテキストの提供
3. **出力指示**: 最優先の要求
4. **Schema**: 具体的な構造
5. **知識**: 判断に必要な情報

Claudeはプロンプトを**上から下に**処理するため、重要な指示を先に配置する。

## 原則5: 明示的な制約

曖昧さを排除する:

### ❌ 曖昧
```markdown
Output JSON format
```

### ✅ 明示的
```markdown
output ONLY valid JSON (no markdown code fences, no commentary)
```

具体的に:
- `ONLY` - 他の形式を排除
- `valid JSON` - パース可能であることを明示
- `no markdown code fences` - ````json ... ````を禁止
- `no commentary` - 説明文を禁止

## 実践例

最終的に採用した構造:

```markdown
# Example Mapping Skill

User Story: {{story_input}}

Analyze the above user story using BDD Example Mapping principles
and output ONLY valid JSON (no markdown code fences, no commentary):

```json
{
  "story": { ... },
  "rules": [ ... ],
  "questions": { ... },
  "next_actions": [ ... ],
  "metadata": { ... }
}
```

## Example Mapping Principles

**3 Amigos Perspectives**:
[Developer, Tester, PO の視点]

**Question Generation Patterns**:
[発見的、明確化、境界値質問]

**FP&A SaaS Brownfield Considerations**:
[既存機能、権限、Excel、UI/UX、データ整合性]

Return pure JSON only - all text values in Japanese.
```

## まとめ

| 原則 | 理由 |
|------|------|
| 重要な指示は冒頭 | Claudeの処理順序に従う |
| 単一責任 | 複雑性を減らす |
| `file://`参照 | 再利用性とバージョン管理 |
| シンプルさと明確さ | メンテナンス性と理解しやすさ |
| 明示的な制約 | 曖昧さの排除 |

## 関連する学び

- [01-variable-expansion.md](./01-variable-expansion.md) - 条件分岐は不要
- [06-preserving-prompt-knowledge.md](./06-preserving-prompt-knowledge.md) - 知識と出力形式の両立
- [10-anti-patterns.md](./10-anti-patterns.md) - 避けるべきパターン
