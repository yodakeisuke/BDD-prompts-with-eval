# Complete Formulation Example

## From Example Mapping to Gherkin

### Input: Example Mapping Cards

```
📄 Story Card (Yellow):
As a オンラインショッパー
I want to 商品を検索する
So that 欲しい商品を素早く見つけられる

📘 Rule 1 (Blue): キーワードに部分一致する商品を表示
📘 Rule 2 (Blue): 検索は大文字/小文字を区別しない
📘 Rule 3 (Blue): 検索結果が0件の場合、メッセージを表示

📗 Example 1.1 (Green): 完全一致
   入力: "MacBook Pro"
   結果: "MacBook Pro" が表示される

📗 Example 1.2 (Green): 前方部分一致
   入力: "Mac"
   結果: "MacBook Pro", "MacBook Air" が表示される

📗 Example 1.3 (Green): 中間一致しない
   入力: "Book"
   結果: 0件

📗 Example 2.1 (Green): 小文字で検索
   入力: "macbook"
   結果: "MacBook Pro", "MacBook Air" が表示される

📗 Example 3.1 (Green): 存在しない商品名
   入力: "Surface"
   結果: "検索結果が見つかりませんでした" + 人気商品提案
```

### Output: Gherkin Feature

```gherkin
Feature: 商品検索
  オンラインショッパーが商品を検索して、欲しい商品を素早く見つけられる

  Background:
    Given 以下の商品が登録されている
      | 商品名          |
      | MacBook Pro     |
      | MacBook Air     |
      | iPad Pro        |
      | Magic Keyboard  |

  Rule: キーワードに部分一致する商品を表示

    Example: 完全一致する商品名で検索
      Given 商品一覧画面を開いている
      When 検索キーワード "MacBook Pro" を入力する
      And 検索ボタンをクリックする
      Then 商品 "MacBook Pro" が表示される

    Example: 前方部分一致で複数商品がヒットする
      Given 商品一覧画面を開いている
      When 検索キーワード "Mac" を入力する
      And 検索ボタンをクリックする
      Then 以下の商品が表示される
        | 商品名      |
        | MacBook Pro |
        | MacBook Air |

    Example: 中間一致しない (前方一致のみ)
      Given 商品一覧画面を開いている
      When 検索キーワード "Book" を入力する
      And 検索ボタンをクリックする
      Then 検索結果は0件である

  Rule: 検索は大文字/小文字を区別しない

    Example: 小文字で検索しても結果が表示される
      Given 商品一覧画面を開いている
      When 検索キーワード "macbook" を入力する
      And 検索ボタンをクリックする
      Then 以下の商品が表示される
        | 商品名      |
        | MacBook Pro |
        | MacBook Air |

  Rule: 検索結果が0件の場合、メッセージを表示

    Example: 存在しない商品名で検索
      Given 商品一覧画面を開いている
      When 検索キーワード "Surface" を入力する
      And 検索ボタンをクリックする
      Then メッセージ "検索結果が見つかりませんでした" が表示される
      And 代替提案として人気商品が表示される
```

## Transformation Steps

### Step 1: Story → Feature + Background
```
📄 Story → Feature 名 + 説明
       → Background (共通の前提条件)
```

### Step 2: Rules → Gherkin Rules
```
📘 Blue Card → Rule: [ビジネスルール名]
```

### Step 3: Examples → Scenarios
```
📗 Green Card → Example: [具体的なシナリオ]
              → Given-When-Then 形式で展開
```

### Key Principles
1. 具体例を Given-When-Then に展開
2. 暗黙の前提を明示的な Given に
3. 結果を検証可能な Then に
4. ビジネス言語を維持