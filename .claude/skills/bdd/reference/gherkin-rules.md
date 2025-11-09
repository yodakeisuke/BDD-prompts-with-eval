# Gherkin Rule キーワード ベストプラクティス

## Rule キーワードとは

`Rule` キーワードは、Gherkin 6以降で導入されたビジネスルールを表現するための構文要素です。Feature内の複数のシナリオを、1つのビジネスルールの下にグループ化します。

## 基本構文

```gherkin
Feature: [フィーチャー名]
  [フィーチャーの説明]

  Background:
    [共通の前提条件]

  Rule: [ビジネスルール名]
    [ルールの詳細説明 - オプション]

    Example: [シナリオ1]
      Given [前提条件]
      When [アクション]
      Then [期待結果]

    Example: [シナリオ2]
      Given [前提条件]
      When [アクション]
      Then [期待結果]

  Rule: [別のビジネスルール名]
    Example: [シナリオ3]
      Given [前提条件]
      When [アクション]
      Then [期待結果]
```

## Rule vs Scenario の使い分け

### Ruleを使うべき時

1. **複数のシナリオが同じビジネスルールを説明する場合**
   - ビジネスルールの正常系、異常系、境界値を網羅するシナリオ群

2. **明示的なビジネスルールが存在する場合**
   - 法規制、業務規則、ポリシーなど

3. **シナリオのグループ化が仕様理解を助ける場合**
   - Feature内が複雑で、ルールごとに整理すると理解しやすい

### Scenarioのみで十分な時

1. **ビジネスルールが自明またはシンプルな場合**
2. **Feature内のシナリオが少ない場合（1-3個程度）**
3. **シナリオ間に明確な関連性がない場合**

## ベストプラクティス

### 1. Rule名はビジネスルールを明確に表現する

```gherkin
# ✅ Good: ビジネスルールが明確
Rule: 購入金額が10,000円以上の場合、送料無料

# ❌ Bad: 技術的な実装に焦点
Rule: ShippingFeeCalculator の動作

# ❌ Bad: 曖昧
Rule: 送料について
```

### 2. 1つのRuleには関連するExampleのみを含める

```gherkin
# ✅ Good
Rule: パスワードは8文字以上必須

  Example: 有効なパスワード
    Given ユーザーが新規登録画面にいる
    When パスワード "SecurePass123" を入力する
    Then パスワードが受け入れられる

  Example: 短すぎるパスワード
    Given ユーザーが新規登録画面にいる
    When パスワード "Short1" を入力する
    Then エラーメッセージ "パスワードは8文字以上必要です" が表示される

# ❌ Bad: 無関係なシナリオが混在
Rule: パスワードは8文字以上必須

  Example: 有効なパスワード
    Given ユーザーが新規登録画面にいる
    When パスワード "SecurePass123" を入力する
    Then パスワードが受け入れられる

  Example: メールアドレスの形式チェック  # ← 別のRuleにすべき
    Given ユーザーが新規登録画面にいる
    When メールアドレス "invalid-email" を入力する
    Then エラーメッセージが表示される
```

### 3. Ruleの粒度を適切に保つ

```gherkin
# ✅ Good: 適切な粒度
Feature: ユーザー登録

  Rule: パスワードは8文字以上、かつ英数字を含む必要がある
    Example: 有効なパスワード（英数字含む）
    Example: 無効なパスワード（短すぎる）
    Example: 無効なパスワード（英字のみ）

  Rule: メールアドレスは一意である必要がある
    Example: 新規のメールアドレスで登録
    Example: 既存のメールアドレスで登録を試みる

# ❌ Bad: 粒度が細かすぎる
Feature: ユーザー登録

  Rule: パスワードは8文字以上必須
    Example: 8文字のパスワード
    Example: 7文字のパスワード

  Rule: パスワードは英字を含む必要がある
    Example: 英字を含むパスワード
    Example: 英字を含まないパスワード

  Rule: パスワードは数字を含む必要がある
    Example: 数字を含むパスワード
    Example: 数字を含まないパスワード
```

### 4. Ruleの説明文でビジネスコンテキストを補足する

```gherkin
Rule: 1日あたりのAPI呼び出し上限は1,000回
  この制限は無料プランのユーザーに適用されます。
  有料プランのユーザーには無制限のアクセスが許可されます。

  Example: 無料プランで上限以内のAPI呼び出し
    Given 無料プランのユーザーがログインしている
    And 本日のAPI呼び出し回数が900回
    When APIを呼び出す
    Then リクエストが成功する

  Example: 無料プランで上限を超えるAPI呼び出し
    Given 無料プランのユーザーがログインしている
    And 本日のAPI呼び出し回数が1,000回
    When APIを呼び出す
    Then エラーコード 429 が返される
    And エラーメッセージ "日次上限に達しました" が表示される
```

### 5. Backgroundとの組み合わせ

```gherkin
Feature: ECサイトの購入フロー

  Background:
    Given 以下の商品がカートに入っている
      | 商品名      | 価格   | 数量 |
      | MacBook Pro | 200,000 | 1    |

  Rule: 購入金額が10,000円以上の場合、送料無料

    Example: 高額商品の購入
      When 購入手続きを進める
      Then 送料は 0円 である

  Rule: 購入金額が10,000円未満の場合、送料500円

    Background:
      # Rule固有のBackgroundも定義可能
      Given カート内の商品を以下に変更する
        | 商品名 | 価格 | 数量 |
        | ペン   | 500  | 1    |

    Example: 少額商品の購入
      When 購入手続きを進める
      Then 送料は 500円 である
```

### 6. タグの継承

Ruleに付与されたタグは、配下のすべてのExampleに継承されます。

```gherkin
Feature: 支払い処理

  @payment @critical
  Rule: クレジットカード決済は3Dセキュア認証が必須

    # このExampleは @payment @critical @smoke タグを持つ
    @smoke
    Example: 3Dセキュア認証に成功
      Given クレジットカード情報を入力している
      When 3Dセキュア認証が成功する
      Then 決済が完了する

    # このExampleは @payment @critical タグを持つ
    Example: 3Dセキュア認証に失敗
      Given クレジットカード情報を入力している
      When 3Dセキュア認証が失敗する
      Then エラーメッセージが表示される
```

## Rule vs Scenario Outline

複数のデータパターンをテストする場合、`Scenario Outline` を使用します。
`Rule` はビジネスルールのグループ化に使用し、データバリエーションのためには使いません。

```gherkin
# ✅ Good
Rule: パスワードは8文字以上、かつ英数字を含む必要がある

  Scenario Outline: パスワードバリデーション
    Given ユーザーが新規登録画面にいる
    When パスワード "<password>" を入力する
    Then 結果は "<result>" となる

    Examples:
      | password      | result |
      | SecurePass123 | 成功   |
      | Short1        | 失敗   |
      | NoNumbers     | 失敗   |
      | 12345678      | 失敗   |

# ❌ Bad: Ruleでデータバリエーションを表現しようとしている
Rule: パスワード "SecurePass123" は有効
  Example: 有効なケース
    ...

Rule: パスワード "Short1" は無効
  Example: 無効なケース
    ...
```

## 実践的な例

### 例1: ECサイトの割引ルール

```gherkin
Feature: 割引計算

  Rule: 会員ランクがゴールドの場合、全商品10%割引

    Example: ゴールド会員が10,000円の商品を購入
      Given ゴールド会員としてログインしている
      When 10,000円の商品をカートに追加する
      Then 割引後の価格は 9,000円 である

    Example: ゴールド会員が複数商品を購入
      Given ゴールド会員としてログインしている
      When 以下の商品をカートに追加する
        | 商品   | 価格   |
        | 商品A  | 5,000  |
        | 商品B  | 3,000  |
      Then 割引後の合計金額は 7,200円 である

  Rule: セール期間中は会員ランク割引とセール割引を併用できない

    Example: ゴールド会員がセール商品を購入
      Given ゴールド会員としてログインしている
      And セール期間中である
      When 20%オフのセール商品（定価10,000円）をカートに追加する
      Then 適用される割引はセール割引（20%）のみ
      And 割引後の価格は 8,000円 である
```

### 例2: アクセス制御

```gherkin
Feature: ドキュメント共有

  Background:
    Given 以下のユーザーが存在する
      | ユーザー名 | 役割    |
      | Alice      | 所有者  |
      | Bob        | 編集者  |
      | Carol      | 閲覧者  |

  Rule: ドキュメント所有者のみがドキュメントを削除できる

    Example: 所有者がドキュメントを削除
      Given Alice がログインしている
      When ドキュメント "Project Plan" を削除する
      Then ドキュメントが削除される

    Example: 編集者がドキュメント削除を試みる
      Given Bob がログインしている
      When ドキュメント "Project Plan" を削除しようとする
      Then エラーメッセージ "削除権限がありません" が表示される
      And ドキュメントは削除されない

  Rule: 編集者はドキュメントの内容を変更できる

    Example: 編集者がドキュメントを編集
      Given Bob がログインしている
      When ドキュメント "Project Plan" の内容を変更する
      Then 変更が保存される

  Rule: 閲覧者はドキュメントを読むことのみ可能

    Example: 閲覧者がドキュメントを編集しようとする
      Given Carol がログインしている
      When ドキュメント "Project Plan" を編集しようとする
      Then 編集ボタンが表示されない
```

## アンチパターン

### ❌ 実装の詳細をRuleに含める

```gherkin
# Bad
Rule: UserRepository.save() が呼ばれる

# Good
Rule: ユーザー情報がシステムに保存される
```

### ❌ Ruleが技術的すぎる

```gherkin
# Bad
Rule: HTTPステータスコード200が返される

# Good
Rule: リクエストが成功した場合、正常なレスポンスが返される
```

### ❌ Ruleが大きすぎる

```gherkin
# Bad
Rule: ユーザー登録に関するすべてのバリデーション
  Example: パスワードチェック
  Example: メールアドレスチェック
  Example: 年齢チェック
  Example: 利用規約同意チェック
  Example: 重複チェック
  # ...20個のExample

# Good: ルールを分割
Rule: パスワードは8文字以上、かつ英数字を含む必要がある
  Example: 有効なパスワード
  Example: 無効なパスワード（短すぎる）
  Example: 無効なパスワード（英数字なし）

Rule: メールアドレスは一意である必要がある
  Example: 新規メールアドレス
  Example: 既存メールアドレス
```

## まとめ

- `Rule` はビジネスルールを明示的に表現し、関連するシナリオをグループ化するための強力なツール
- 1つのRuleには3-5個程度のExampleが適切
- ビジネス言語を使用し、技術的実装の詳細は含めない
- タグの継承を活用し、テスト実行を効率化する
- Ruleが多すぎる、または大きすぎる場合はFeatureの分割を検討する

---

*参考: [Cucumber Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)*
