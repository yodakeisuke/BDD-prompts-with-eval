# Gherkin Patterns Reference

## Given-When-Then Examples

### Given (前提条件)

```gherkin
# ✅ Good
Given ユーザー "alice@example.com" が登録されている
Given 以下の商品がカートに入っている
  | 商品名      | 価格    | 数量 |
  | MacBook Pro | 200,000 | 1    |

# ❌ Bad
Given データベースをリセットする  # 技術的すぎる
Given ログインページを開く        # Whenであるべき
```

### When (アクション)

```gherkin
# ✅ Good
When メールアドレス "alice@example.com" を入力する
When 購入ボタンをクリックする

# ❌ Bad
When ユーザーがログインする  # 曖昧、Givenであるべき可能性
When エラーが発生する        # Thenであるべき
```

### Then (期待結果)

```gherkin
# ✅ Good
Then ダッシュボード画面に遷移する
Then エラーメッセージ "パスワードが正しくありません" が表示される
Then 以下の商品が検索結果に表示される
  | 商品名      |
  | MacBook Pro |
  | MacBook Air |

# ❌ Bad
Then ユーザーはログインできる  # 曖昧、具体的な結果が不明
Then API が呼ばれる            # 技術的すぎる、ビジネス観点が不明
```

## Advanced Techniques

### Scenario Outline (データ駆動テスト)

```gherkin
Rule: パスワードは8文字以上かつ英数字を含む必要がある

  Scenario Outline: パスワードバリデーション
    Given ユーザー登録画面を開いている
    When パスワード "<password>" を入力する
    Then 結果は "<result>" となる

    Examples:
      | password       | result |
      | SecurePass123  | 成功   |
      | Short1         | 失敗   |
      | NoNumbers      | 失敗   |
      | 12345678       | 失敗   |
```

### Data Tables

```gherkin
Given 以下のユーザーが登録されている
  | ユーザー名 | メールアドレス    | 役割   |
  | Alice      | alice@example.com | 管理者 |
  | Bob        | bob@example.com   | 編集者 |
```

### Doc Strings

```gherkin
When 以下のJSON を送信する
  """
  {
    "email": "alice@example.com",
    "password": "SecurePass123"
  }
  """
```

## Quality Checklist

### ビジネス観点
- [ ] ビジネス用語で記述されている
- [ ] ステークホルダーが理解できる
- [ ] ビジネス価値が明確

### 技術観点
- [ ] 実行可能な形式
- [ ] 検証可能な期待結果
- [ ] 各Exampleは単一の振る舞い
- [ ] 各Exampleは3-5ステップ

### 完全性
- [ ] 正常系がカバーされている
- [ ] 異常系・エラーケースがある
- [ ] 境界値ケースが含まれている

## Do's & Don'ts

### DO ✅
1. ビジネス言語を使う: 技術用語を避ける
2. 単一の振る舞い: 1 Example = 1つのテストケース
3. 具体的な値を使う: 曖昧な表現を避ける
4. Background を活用: 繰り返しを減らす
5. Rule でグループ化: 関連するシナリオをまとめる

### DON'T ❌
1. 実装の詳細を含めない: UI要素のIDやAPIエンドポイントは避ける
2. シナリオを長くしすぎない: 3-5ステップが目安
3. AND を多用しない: 各ステップは明確に
4. 曖昧な表現を使わない: 「適切に」「正しく」など
5. 技術的なセットアップを含めない: データベースリセットなど