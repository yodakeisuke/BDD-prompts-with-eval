# 04. JSON出力の強制方法

**Index**: [README](./README.md) > 04-forcing-json-output

## 問題

Claudeが時々以下のような出力を返す:

1. **会話形式**: "I'll help you analyze..."
2. **Markdown code block**: ````json { ... } ````
3. **説明付きJSON**: "Here's the analysis: { ... }"

期待: 純粋なJSON文字列のみ

## 失敗パターン

### パターン1: 曖昧な指示

```markdown
Output in JSON format
```

結果: ````json ... ````のmarkdown blockを返す

### パターン2: 変数存在チェック

```markdown
When {{story_input}} variable is provided, output JSON...
```

結果: promptfooが変数を展開するため、この条件は意味をなさない

### パターン3: JSON例のみ提示

```markdown
Example output:
{
  "story": { ... }
}
```

結果: Claudeが説明文を追加する

## 成功パターン

### 基本形

```markdown
User Story: {{story_input}}

Analyze the above user story using BDD Example Mapping principles
and output ONLY valid JSON (no markdown code fences, no commentary):
```

### 重要な要素

| 要素 | 効果 |
|------|------|
| `output ONLY` | 他の形式を排除 |
| `valid JSON` | パース可能であることを明示 |
| `no markdown code fences` | ````を禁止 |
| `no commentary` | 説明文を禁止 |

## スキーマの提示方法

### ❌ 間違い: スキーマなし

```markdown
Output JSON with story, rules, questions fields.
```

問題: 構造が曖昧

### ✅ 正解: 完全なスキーマ提示

````markdown
```json
{
  "story": {
    "as_a": string,        // ペルソナ（日本語）
    "i_want_to": string,   // 実現したいこと（日本語）
    "so_that": string      // ビジネス価値（日本語）
  },
  "rules": [              // 1-5個が適切、7個以上なら分割検討
    {
      "id": string,       // "rule_1", "rule_2"...
      "name": string,     // ビジネスルール名（日本語）
      "examples": [ ... ]
    }
  ],
  "questions": {
    "blocker": [],         // 実装前に解決必須（日本語）
    "clarification": [],   // 明確化で品質向上（日本語）
    "future": []          // 将来検討（日本語）
  },
  "next_actions": [],     // アクション項目（日本語）
  "metadata": {
    "rule_count": number,
    "example_count": number,
    "question_count": number
  }
}
```
````

利点:
- フィールド名が明確
- 型が明確
- コメントで期待値を説明
- ネスト構造を正確に示す

## 最後のリマインダー

スキーマ提示の後に、もう一度明示:

```markdown
Return pure JSON only - all text values in Japanese.
```

なぜ繰り返すか:
- スキーマ提示で「例示」と誤解される可能性
- 最後のリマインダーで「実際の要求」を強調

## テンプレート

以下のテンプレートをコピーして使用可能:

```markdown
# [Skill Name]

[Input Variables]: {{variable_name}}

Analyze the above [context] and output ONLY valid JSON (no markdown code fences, no commentary):

```json
{
  // Your schema here
}
```

[Domain knowledge and principles]

Return pure JSON only - [additional constraints].
```

## markdown code blockが返された場合

assertion側で対応する:

```javascript
function extractJSON(text) {
  const match = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  return match ? match[1].trim() : text.trim();
}
```

詳細: [05-json-extraction-in-assertions.md](./05-json-extraction-in-assertions.md)

## デバッグ方法

出力が期待通りでない場合:

1. **promptfoo viewで確認**
   ```bash
   pnpm eval:ui
   ```
   実際の出力を目視

2. **permission_modeを確認**
   ```yaml
   # permission_mode: plan  # これが原因の場合が多い
   ```

3. **プロンプトの先頭を確認**
   重要な指示が冒頭にあるか？

## まとめ

JSON出力を強制するための3つの柱:

1. **明示的な指示**: "ONLY valid JSON (no markdown code fences, no commentary)"
2. **完全なスキーマ提示**: 型とコメント付きのJSON example
3. **最後のリマインダー**: "Return pure JSON only"

## 関連する学び

- [02-permission-mode.md](./02-permission-mode.md) - permission_modeの影響
- [03-prompt-design-principles.md](./03-prompt-design-principles.md) - 明示的な制約の原則
- [05-json-extraction-in-assertions.md](./05-json-extraction-in-assertions.md) - assertion側の対応
