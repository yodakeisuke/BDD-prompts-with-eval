# 06. プロンプト知識の保持

**Index**: [README](./README.md) > 06-preserving-prompt-knowledge

## 問題

JSON出力を強制しようとして、重要なExample Mappingの知識を削除してしまった:

削除前: 3 Amigos perspectives, 質問パターン、分割の兆候、タイムボックス管理など
削除後: JSON schema のみ

結果: テストは100%パスしたが、プロンプトの品質が大幅に低下

## 誤った仮定

「JSON出力を強制する」= 「対話的な知識は不要」

## 正しい理解

**Claudeはプロンプト全体のコンテキストを使用して応答を生成する**

つまり:
- JSON出力指示 → **出力形式**を決定
- ドメイン知識 → **出力内容**の品質を決定

両者は独立した役割を持つ。

## 解決策: 構造的分離

### 最終的な構造

```markdown
# Example Mapping Skill

User Story: {{story_input}}

Analyze the above user story using BDD Example Mapping principles
and output ONLY valid JSON (no markdown code fences, no commentary):

[JSON schema]

## Example Mapping Principles

**3 Amigos Perspectives** - Apply all three viewpoints:

**Developer:**
- このロジックは複雑すぎませんか?
- 既存機能と矛盾しませんか?

**Tester:**
- エッジケースは網羅されていますか?
- エラー時の振る舞いを明確にしましょう

**Product Owner:**
- ビジネス価値は何ですか?
- MVPに含める最小限のルールは?

**Question Generation Patterns:**
[発見的、明確化、境界値質問]

**分割の兆候:**
- ルール7個以上
- 質問10個以上

**FP&A SaaS Brownfield Considerations:**
- 既存機能との整合性
- 権限・承認フローへの影響

Return pure JSON only - all text values in Japanese.
```

### セクションの役割

| セクション | 役割 | 影響 |
|-----------|------|------|
| JSON schema | 出力形式の定義 | 構造の一貫性 |
| 3 Amigos | 質問生成の視点 | questions配列の質 |
| Question Patterns | 具体的な質問例 | 曖昧性の発見力 |
| 分割の兆候 | 複雑性の判断基準 | metadataと提案の質 |
| Brownfield考慮事項 | ドメイン特化知識 | FP&A特有の質問 |

## 実証: Before/After

### Before (知識削除後)

```markdown
User Story: {{story_input}}

Output JSON:
[JSON schema only]
```

出力例:
```json
{
  "questions": {
    "blocker": [
      "色の仕様は？"
    ]
  }
}
```

**問題**: 質問が表面的

### After (知識復元後)

```markdown
[JSON schema]

## Example Mapping Principles
[3 Amigos, Question Patterns, Brownfield考慮事項]
```

出力例:
```json
{
  "questions": {
    "blocker": [
      "マイナス値の赤字表示は、Excel出力にも適用しますか？",
      "既存のゼロ値の表示色はどうしますか？",
      "色覚多様性への配慮はどうしますか？"
    ],
    "clarification": [
      "赤字の具体的な色コード（#FF0000等）は？",
      "フォントの太さや背景色の変更も必要ですか？"
    ]
  }
}
```

**改善**: 多角的で実践的な質問

## なぜ知識が効くのか

Claudeの動作原理:
1. プロンプト全体を読み込み
2. コンテキストとして記憶
3. 出力生成時に参照

つまり、「JSON schemaの後に書かれた知識」も、JSON生成時に活用される。

## 配置の原則

### 優先度順

```markdown
1. [変数と出力形式] ← 最優先
2. [JSON schema]     ← 構造定義
3. [ドメイン知識]     ← 内容の質
4. [最後のリマインダー] ← 念押し
```

なぜこの順序か:
- Claudeは上から読むが、全体をコンテキストとして保持
- 出力形式は最初に明示（誤解を防ぐ）
- 知識は後で参照される（生成時にアクセス）

## 知識の粒度

### ❌ 過度に詳細

```markdown
**Developer:**
1. ロジックの複雑性を評価してください。複雑度が10を超える場合は分割を提案してください。
2. 既存機能との整合性を確認してください。データベーススキーマの変更が必要な場合は...
[100行続く]
```

問題: プロンプトが肥大化、本質が埋もれる

### ❌ 過度に抽象的

```markdown
**Developer:** 技術的な観点で質問してください
```

問題: 具体性がない、Claudeが判断に迷う

### ✅ 適度な具体性

```markdown
**Developer:**
- このロジックは複雑すぎませんか?
- 既存機能と矛盾しませんか?
- 境界値テストを追加しましょう
```

利点: 具体的だが簡潔、Claudeが拡張できる

## テストでの検証

knowledge有無でのテスト結果比較:

| ケース | 知識なし | 知識あり |
|--------|----------|----------|
| 質問数 | 2-3個 | 7-9個 |
| 質問の深さ | 表面的 | 多角的 |
| FP&A特化 | なし | あり |
| 3 Amigos視点 | 1視点 | 3視点 |

**結論**: 知識は出力の質に直接影響する

## まとめ

| 原則 | 理由 |
|------|------|
| 出力形式と知識は両立 | 役割が異なる |
| 知識は冒頭でなくてもよい | Claudeは全体を参照 |
| 適度な粒度で記述 | 簡潔さと具体性のバランス |
| テストで検証 | 知識の効果を測定 |

## 関連する学び

- [03-prompt-design-principles.md](./03-prompt-design-principles.md) - 構造化の原則
- [04-forcing-json-output.md](./04-forcing-json-output.md) - 出力形式の制御
- [08-test-driven-prompt-development.md](./08-test-driven-prompt-development.md) - 段階的知識追加
