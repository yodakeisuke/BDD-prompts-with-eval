# Gherkin Anti-Patterns

## Specification by Example Principles Violated

### ❌ 抽象的なルールから始める

```gherkin
# Bad: 具体例がない
Feature: ユーザー認証
  ユーザーは有効な認証情報でログインできる

  Example: ログイン成功
    Given ユーザーが登録されている
    When ログインする
    Then ログインできる
```

```gherkin
# Good: 具体例から始める
Feature: ユーザー認証

  Example: 正しいメールアドレスとパスワードでログイン
    Given ユーザー "alice@example.com" が登録されている
    When メールアドレス "alice@example.com" を入力する
    And パスワード "SecurePass123" を入力する
    And ログインボタンをクリックする
    Then ダッシュボード画面に遷移する
```

### ❌ 技術用語で記述

```gherkin
# Bad: 実装の詳細が露出
Given データベースに user_id=1 のレコードが存在する
When POST /api/auth リクエストを送信する
Then HTTP 200 とJWTトークンが返される
```

```gherkin
# Good: ビジネス言語で記述
Given ユーザー "alice@example.com" が登録されている
When メールアドレスとパスワードでログインする
Then ダッシュボード画面に遷移する
```

## Common Mistakes

### ❌ Given と When の混同

```gherkin
# Bad: Given にアクションが含まれる
Given ログインページを開く  # これは When

# Good
When ログインページを開く
```

### ❌ When と Then の混同

```gherkin
# Bad: When に結果が含まれる
When エラーが発生する  # これは Then

# Good
Then エラーメッセージが表示される
```

### ❌ 曖昧な表現

```gherkin
# Bad
Then ユーザーはログインできる  # どういう状態？
Then システムは正しく動作する   # 何をもって正しい？
Then 適切なエラーが表示される   # どんなエラー？

# Good
Then ダッシュボード画面に遷移する
Then エラーメッセージ "パスワードが正しくありません" が表示される
```

### ❌ 長すぎるシナリオ

```gherkin
# Bad: 1シナリオに複数の振る舞い
Example: ユーザー登録からログインまで
  Given 登録画面を開く
  When メールアドレスを入力する
  And パスワードを入力する
  And 登録ボタンをクリックする
  And 確認メールのリンクをクリックする
  And ログインページを開く
  And メールアドレスを入力する
  And パスワードを入力する
  And ログインボタンをクリックする
  Then ダッシュボード画面に遷移する
```

```gherkin
# Good: 1シナリオ = 1振る舞い
Background:
  Given ユーザー "alice@example.com" が登録済みである

Example: 登録済みユーザーがログイン
  Given ログインページを開いている
  When メールアドレス "alice@example.com" を入力する
  And パスワード "SecurePass123" を入力する
  And ログインボタンをクリックする
  Then ダッシュボード画面に遷移する
```

### ❌ UI要素の具体的な記述

```gherkin
# Bad: UI実装に依存
Given id="login-form" のフォームを開く
When class="btn-primary" のボタンをクリックする

# Good: ビジネス観点
Given ログインフォームを開いている
When ログインボタンをクリックする
```

## Specification by Example Violations

### Living Documentation として機能しない例

```gherkin
# Bad: 技術的すぎて仕様書として読めない
Feature: API Authentication

  Example: JWT token validation
    Given mock user repository returns user object
    When POST /api/v1/auth/login with valid credentials
    Then response status is 200
    And response body contains JWT token
    And token is stored in Redis with TTL 3600
```

```gherkin
# Good: ビジネス仕様として読める
Feature: ユーザー認証

  Example: 登録済みユーザーが正しい認証情報でログイン
    Given ユーザー "alice@example.com" が登録されている
    When メールアドレスとパスワードでログインする
    Then ダッシュボード画面に遷移する
    And セッションが1時間保持される
```

## Recovery Strategies

### 複雑すぎる場合
→ Example Mapping に戻ってストーリーを分割

### 技術的すぎる場合
→ ビジネスステークホルダーに読んでもらう

### 曖昧すぎる場合
→ 具体的な値や状態を追加

### 長すぎる場合
→ Background に共通部分を抽出
→ 複数のシナリオに分割