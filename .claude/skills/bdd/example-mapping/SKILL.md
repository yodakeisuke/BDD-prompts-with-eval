# Example Mapping Skill

CRITICAL OUTPUT REQUIREMENT: You MUST return ONLY raw JSON. DO NOT use markdown code fences (no ```json). DO NOT add any commentary before or after the JSON. Start your response with { and end with }.

User Story: {{story_input}}

Analyze the above user story using BDD Example Mapping principles.

REQUIRED JSON SCHEMA (all text values in Japanese):

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
      "examples": [       // 各ルール1-3個
        {
          "id": string,             // "example_1_1"...
          "description": string,    // 例の概要（日本語）
          "details": string         // Given/When/Then（日本語）
        }
      ]
    }
  ],
  "questions": {
    "blocker": [],         // 実装前に解決必須（日本語）
    "clarification": [],   // 明確化で品質向上（日本語）
    "future": []          // 将来検討（日本語）
  },
  "next_actions": []      // アクション項目（日本語）
}

## Example Mapping Principles

**3 Amigos Perspectives** - Apply all three viewpoints when analyzing:

**Developer:**
- このロジックは複雑すぎませんか?
- 既存機能と矛盾しませんか?
- 境界値テストを追加しましょう

**Tester:**
- エッジケースは網羅されていますか?
- エラー時の振る舞いを明確にしましょう
- 自動テスト可能ですか?

**Product Owner:**
- ビジネス価値は何ですか?
- 最も重要なシナリオはどれですか?
- MVPに含める最小限のルールは?

**Question Generation Patterns:**

発見的質問:
- 守るべきビジネスルールは何ですか?
- どんな条件下で動作すべきですか?
- 禁止事項や制約条件は?

明確化質問:
- 『〇〇の場合』とは具体的に?
- この条件は必須ですか?

境界値質問:
- 最小値・最大値は?
- 空/ゼロの場合は?
- エラー時の振る舞いは?

**分割の兆候 (suggest split if detected):**
- ルール7個以上
- 各ルール5個以上の例
- 質問10個以上
- 異なるペルソナ混在

**FP&A SaaS Brownfield Considerations:**
- 既存機能との整合性
- 権限・承認フローへの影響
- Excel出力への影響
- UI/UX制約
- データ整合性