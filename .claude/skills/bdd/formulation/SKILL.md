# Formulation Skill

Example Mappingの成果物を実行可能なGherkin仕様に変換します。

## Input
- Example Mappingカード (📄 黄 / 📘 青 / 📗 緑 / 📕 赤)
- Active Listningの成果物 (ビジネス価値、ペルソナ、スコープ)

## Output
- `.feature` ファイル (Gherkin形式)
- 実行可能なテストシナリオ
- 品質検証済みの受入基準

## Core Workflow

### 1. Feature + Background (5分)

Story Card → Feature定義

```gherkin
Feature: [フィーチャー名]
  [ビジネス価値を含む説明]

  Background:
    Given [すべてのシナリオに共通する前提条件]
```

**原則:**
- フィーチャー名は3-5単語
- 説明にビジネス価値を明記
- 繰り返し出現するGivenをBackgroundに抽出

### 2. Rules (5分)

Blue Cards → Gherkin Rules

```gherkin
Rule: [ビジネスルール名]
  [ルールの詳細説明]
```

**原則:**
- 1 Blue Card = 1 Rule
- ビジネス用語で記述
- 1 Featureに1-5個のRuleが適切

### 3. Examples (10-15分)

Green Cards → Given-When-Then シナリオ

```gherkin
Example: [シナリオの説明]
  Given [前提条件]
  When [アクション]
  Then [期待される結果]
```

**変換パターン:**
```
📗 入力: "Mac" → 結果: "MacBook Pro", "MacBook Air"

↓ 展開

Example: 前方部分一致で複数商品がヒットする
  Given 商品一覧画面を開いている
  When 検索キーワード "Mac" を入力する
  And 検索ボタンをクリックする
  Then 以下の商品が表示される
    | 商品名      |
    | MacBook Pro |
    | MacBook Air |
```

**原則:**
- 1 Green Card = 1 Example
- 1 Example = 1つの振る舞い
- 3-5ステップが目安
- 暗黙の前提を明示的なGivenに
- 結果を検証可能なThenに

### 4. Quality Check (5分)

以下の観点で検証:

**ビジネス観点:**
- [ ] ビジネス用語で記述
- [ ] ステークホルダーが理解可能
- [ ] ビジネス価値が明確

**技術観点:**
- [ ] 実行可能な形式
- [ ] 検証可能な期待結果
- [ ] 各Exampleは単一の振る舞い
- [ ] 3-5ステップ

**完全性:**
- [ ] 正常系カバー
- [ ] 異常系・エラーケース
- [ ] 境界値ケース

## Specification by Example 原則

### ✅ DO
1. **具体例から始める**: 抽象的なルールではなく具体値を使う
2. **ビジネス言語**: 技術用語・実装詳細を避ける
3. **Living Documentation**: 仕様書・受入基準・テスト・ドキュメントを兼ねる

### ❌ DON'T
1. UI要素ID・APIエンドポイントを含めない
2. 曖昧な表現を使わない (「適切に」「正しく」)
3. 技術的なセットアップを含めない (DBリセットなど)

## Advanced Patterns

**Scenario Outline** (データ駆動):
```gherkin
Scenario Outline: [シナリオ名]
  Given [前提]
  When [アクション] "<param>"
  Then [結果] "<expected>"

  Examples:
    | param | expected |
    | val1  | result1  |
```

**Data Tables**:
```gherkin
Given 以下のユーザーが登録されている
  | ユーザー名 | メール           |
  | Alice      | alice@example.com |
```

**Doc Strings**:
```gherkin
When 以下のJSONを送信する
  """
  {"key": "value"}
  """
```

## References

詳細パターンとアンチパターンは `reference/` を参照:

- `gherkin-patterns.md`: Given-When-Thenパターン集、品質チェックリスト
- `complete-example.md`: Example Mapping → Gherkin 完全変換例
- `anti-patterns.md`: よくある間違いと回避策

## Recovery Strategies

- **複雑すぎる** → Example Mappingに戻ってストーリー分割
- **技術的すぎる** → ビジネスステークホルダーにレビュー依頼
- **曖昧すぎる** → 具体的な値・状態を追加
- **長すぎる** → Background抽出 or シナリオ分割

---
*Gojko Adzic "Specification by Example" / Cucumber Gherkin Guide / Dan North BDD Practicesに基づく*
