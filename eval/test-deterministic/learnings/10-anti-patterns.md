# 10. アンチパターン

**Index**: [README](./README.md) > 10-anti-patterns

避けるべき実装パターン集。今回の試行錯誤で遭遇した失敗例から学ぶ。

## アンチパターン1: promptfooconfig.yamlに直接プロンプトを記述

### ❌ 間違い

```yaml
prompts:
  - |
    You are Claude Agent performing BDD Example Mapping analysis for FP&A SaaS development.

    User Story: {{story_input}}

    Analyze the above user story using Example Mapping principles
    and output ONLY valid JSON (no markdown code fences, no commentary):

    {
      "story": { ... },
      [50行続く]
    }

    Apply 3 Amigos perspectives (Developer, Tester, PO) to generate questions.
    For FP&A SaaS brownfield enhancements, consider: existing features...
```

### 問題点

1. **再利用性ゼロ**: 他のテスト設定で使えない
2. **バージョン管理が困難**: promptfooconfig.yamlが肥大化
3. **IDE support欠如**: syntax highlighting, lintingが効かない
4. **反復的改善が困難**: promptfoo viewとの往復が面倒
5. **チーム共有が困難**: プロンプトの差分が見づらい

### ✅ 正解

```yaml
prompts:
  - file://../../.claude/skills/bdd/example-mapping/SKILL.md
```

## アンチパターン2: 条件分岐による出力形式の切り替え

### ❌ 間違い

```markdown
{% if story_input %}
  User Story: {{story_input}}
  Output JSON mode...
{% else %}
  Welcome to Example Mapping!
  Let's start an interactive session...
{% endif %}
```

### 問題点

1. **不要な複雑性**: promptfooでは常に変数が展開される
2. **メンテナンス困難**: 2つのモードを維持する必要
3. **テストが不安定**: 条件分岐のロジックミスで予期しない挙動
4. **単一責任原則違反**: 1つのプロンプトが2つの役割

### ✅ 正解

目的ごとにプロンプトファイルを分離:
- `SKILL.md`: JSON出力専用
- `interactive-session.md`: 対話型セッション用（必要なら）

## アンチパターン3: permission_modeを無考慮に設定

### ❌ 間違い

```yaml
providers:
  - id: anthropic:claude-agent-sdk
    config:
      model: sonnet
      permission_mode: plan  # デフォルトで設定してしまう
      setting_sources:
        - project
```

### 問題点

1. **JSON出力が困難**: 対話モードが優先される
2. **deterministic testに不適**: 会話形式の出力を返す
3. **トークン消費増**: 説明的な応答で長くなる

### ✅ 正解

テストタイプに応じて設定:

```yaml
# deterministic test: permission_modeなし
providers:
  - id: anthropic:claude-agent-sdk
    config:
      model: sonnet
      working_dir: ./sandbox
      # permission_mode不要
      setting_sources:
        - project
```

```yaml
# 対話型テスト: permission_mode: plan
providers:
  - id: anthropic:claude-agent-sdk
    config:
      model: sonnet
      working_dir: ./sandbox
      permission_mode: plan  # 対話には有用
      setting_sources:
        - project
```

## アンチパターン4: assertionでJSON.parse()を直接呼ぶ

### ❌ 間違い

```javascript
const out = JSON.parse(output);  // markdown code blockがあると失敗
```

### 問題点

1. **脆弱性**: Claudeが時々````json...````を返す
2. **不安定なテスト**: 時々パスし、時々失敗する
3. **デバッグ困難**: SyntaxErrorだけでは原因不明

### ✅ 正解

```javascript
function extractJSON(text) {
  const match = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  return match ? match[1].trim() : text.trim();
}
const out = JSON.parse(extractJSON(output));
```

**全てのassertionで一貫して使用**。

参考: [05-json-extraction-in-assertions.md](./05-json-extraction-in-assertions.md)

## アンチパターン5: ファイル末尾にJSON出力モードを配置

### ❌ 間違い

```markdown
# Example Mapping Skill

[対話型ガイダンス 200行]

## Structured Output Mode
User Story: {{story_input}}
Output JSON...
```

### 問題点

1. **Claudeが先に応答**: 上から読むため、対話モードと認識
2. **JSON出力指示が遅すぎる**: 重要な指示が埋もれる
3. **意図が不明確**: どちらが主目的か曖昧

### ✅ 正解

重要な指示は冒頭に:

```markdown
# Example Mapping Skill

User Story: {{story_input}}

Analyze and output ONLY valid JSON:

[JSON schema]

## Principles
[ドメイン知識]
```

参考: [03-prompt-design-principles.md](./03-prompt-design-principles.md)

## アンチパターン6: JSON出力のために知識を削除

### ❌ 間違い

```markdown
# Before (知識あり)
[3 Amigos, Question Patterns, Brownfield Considerations]

# After (知識削除)
User Story: {{story_input}}
Output JSON: [schema only]
```

### 問題点

1. **出力品質の低下**: 質問が表面的になる
2. **ドメイン知識の喪失**: FP&A特有の視点が欠落
3. **誤った仮定**: 「JSON出力 = 知識不要」

### ✅ 正解

出力形式と知識は両立できる:

```markdown
User Story: {{story_input}}

Output ONLY valid JSON:
[JSON schema]

## Example Mapping Principles
[3 Amigos, Question Patterns, Brownfield Considerations]
```

Claudeはプロンプト全体をコンテキストとして使用する。

参考: [06-preserving-prompt-knowledge.md](./06-preserving-prompt-knowledge.md)

## アンチパターン7: 曖昧な出力指示

### ❌ 間違い

```markdown
Output in JSON format
```

### 問題点

1. **markdown code blockを返す**: ````json ... ````
2. **説明文を追加**: "Here's the analysis: { ... }"
3. **会話形式と混在**: "I'll analyze this. The result is: { ... }"

### ✅ 正解

明示的で排他的な指示:

```markdown
output ONLY valid JSON (no markdown code fences, no commentary)
```

各要素の意味:
- `ONLY`: 他の形式を排除
- `valid JSON`: パース可能であることを明示
- `no markdown code fences`: ````を禁止
- `no commentary`: 説明文を禁止

参考: [04-forcing-json-output.md](./04-forcing-json-output.md)

## アンチパターン8: assertionに`return`文がない

### ❌ 間違い

```javascript
assert:
  - type: javascript
    value: |
      const out = JSON.parse(extractJSON(output));
      const hasStory = out.story && out.story.as_a;
      // returnがない！
```

エラー:
```
Custom function must return a boolean, number, or GradingResult object.
Got type undefined
```

### ✅ 正解

```javascript
assert:
  - type: javascript
    value: |
      const out = JSON.parse(extractJSON(output));
      const hasStory = out.story && out.story.as_a;
      return hasStory;  // 明示的にreturn
```

## アンチパターン9: 絶対パスの使用

### ❌ 間違い

```yaml
prompts:
  - file:///absolute/path/to/project/.claude/skills/bdd/example-mapping/SKILL.md
```

### 問題点

1. **環境依存**: 他の開発者のマシンで動かない
2. **バージョン管理に不適**: 環境固有のパスが含まれる
3. **CI/CDで失敗**: パスが異なる

### ✅ 正解

相対パス:

```yaml
prompts:
  - file://../../.claude/skills/bdd/example-mapping/SKILL.md
```

参考: [07-file-reference-paths.md](./07-file-reference-paths.md)

## アンチパターン10: promptfoo viewの誤解

### ❌ 間違い

```bash
# 1. プロンプト修正
vim SKILL.md

# 2. promptfoo view確認
pnpm eval:ui

# 3. 「修正が反映されていない！バグだ！」
```

### 問題点

**promptfoo viewは既存の結果を表示するのみ**。新しいLLM呼び出しは行わない。

### ✅ 正解

```bash
# 1. プロンプト修正
vim SKILL.md

# 2. テスト再実行 (新しいLLM呼び出し)
pnpm eval:deterministic

# 3. promptfoo view確認
pnpm eval:ui
```

参考: [09-debugging-tips.md](./09-debugging-tips.md)

## まとめ

| アンチパターン | 正しいアプローチ |
|---------------|-----------------|
| config内にプロンプト記述 | `file://`参照 |
| 条件分岐で出力形式切り替え | 目的別にファイル分離 |
| permission_mode無考慮 | テストタイプに応じて設定 |
| JSON.parse()直接呼び出し | extractJSON()使用 |
| ファイル末尾にJSON指示 | 冒頭に配置 |
| 知識削除 | 出力形式と知識を両立 |
| 曖昧な出力指示 | 明示的で排他的な指示 |
| returnなし | 明示的にreturn |
| 絶対パス | 相対パス |
| promptfoo view誤解 | 再テスト必須を理解 |

これらのアンチパターンを避けることで、安定した効率的なテスト駆動プロンプト開発が可能になる。

## 関連する学び

全ての学びと関連。このドキュメントは各アンチパターンの詳細な解説へのインデックスとして機能する。
