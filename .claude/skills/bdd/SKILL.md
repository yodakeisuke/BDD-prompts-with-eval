# BDD受入基準作成

曖昧な要求から形式化された実行可能な受入基準を作成します。BDDの3技法（Active Listening、Example Mapping、Formulation）を対話的にイテレーティブに使い分け、仕様を発見・文書化します。

## 入出力

**入力**: 曖昧な仕様、未整理のユーザーストーリー、口頭説明、既存ドキュメント断片
**出力**: Gherkin形式の受入基準、ビジネスルール定義、実行可能シナリオ、未解決質問リスト

## 使用タイミング

バックログ詳細化、要求明確化、スコープ確定、共通理解の構築、TDD/BDD開始時

## イテレーティブアプローチ

3つの技法を線形フェーズではなく、状況に応じて柔軟に使い分ける「引き出し」として活用します。

```
曖昧な要求
    ↓
┌─────────────────────────────┐
│ Active Listening ⇄ Example │
│   (傾聴・深掘り)   Mapping  │
│                   (構造化)  │
│         ⇅                   │
│    Formulation              │
│   (形式化・文書化)           │
│                             │
│ ※必要に応じて自由に行き来   │
└─────────────────────────────┘
    ↓
形式化された受入基準
```

### 技法の使い分け

#### Active Listening（傾聴・深掘り）
**使用場面**: 要求が曖昧/矛盾がある/ビジネス価値が不明確/スコープ境界が不明
**主要技法**: ソクラテス式問答、5 Whys、仮説検証、オープンクエスチョン
**詳細**: `active-listening/SKILL.md`

#### Example Mapping（構造化・可視化）
**使用場面**: ルール詳細化/エッジケース洗い出し/共通理解構築/情報の構造化
**主要技法**: カラーカードシステム(📄Story/📘Rules/📗Examples/📕Questions)、25分タイムボックス、3 Amigos視点
**入出力**: ユーザーストーリー → 構造化JSON(story/rules/examples/questions)
**詳細**: `example-mapping/SKILL.md`

#### Formulation（形式化・文書化）
**使用場面**: ルール整理完了/Gherkin文書化/実装可能形式への変換/自動テスト基盤作成
**主要技法**: Specification by Example、Given-When-Then、Ruleキーワード
**詳細**: `formulation/SKILL.md`

## 対話例: 技法の切り替え

```
User: ログイン機能の受入基準を作成したい
Claude: まず、なぜログイン機能が必要ですか? [Active Listening]

User: ユーザーごとに異なる情報を表示したいから
Claude: なぜ異なる情報を? [5 Whys]

User: 購入履歴に基づくおすすめ商品表示のため
Claude: 真の目的は「パーソナライゼーション」ですね。
        ではルールを整理しましょう。[→ Example Mapping]
        📄 Story: ユーザーがログインして個人化された体験を得る
        どんな場合にログインできますか?

User: 正しいメールとパスワード入力時
Claude: 📘 Rule 1: 有効な認証情報でログイン可
        逆にログインできない場合は?

User: パスワード間違い... あとセキュリティでロックも必要かも
Claude: ロック要件の詳細を教えてください。[→ Active Listening]
        何回失敗/ロック期間/解除方法は?

User: 業界標準で良いかな
Claude: 仮説: 5回失敗→30分ロック→自動解除で良いですか? [仮説検証]

User: はい
Claude: 📘 Rule 3: 連続失敗でアカウントロック
        [→ Example Mapping継続]
        Rule 1の具体例: 正しい認証情報でログイン時は?

User: ダッシュボード画面に遷移
Claude: 📗 Example 1.1: Given ユーザー登録済み / When 正しい認証情報入力
        / Then ダッシュボード遷移

        形式化できそうですね。[→ Formulation]

        Rule: 有効な認証情報でログインできる
          Example: 正しい認証情報でログイン
            Given ユーザー "alice@example.com" が登録されている
            When メールアドレス "alice@example.com" を入力する
            And パスワード "SecurePass123" を入力する
            Then ダッシュボード画面に遷移する

User: OK!
Claude: [→ Example Mapping] では Rule 2, 3の具体例も...
```

## 対話パターン

**曖昧な要求**: Active Listening深掘り → Example Mapping構造化 → 順次Formulation
**詳細不足**: Example Mapping洗い出し ⇄ Active Listening ⇄ Formulation
**仕様改善**: Formulation→レビュー → Example Mapping再整理 → Active Listening確認

## 品質基準

**ビジネス**: ビジネス価値明確/ビジネス用語使用/ステークホルダー理解可能/実装詳細除外
**技術**: 実行可能形式/検証可能な期待結果/Example単一振る舞い/3-5ステップ以内
**プロセス**: 対話ベース作成/3視点検証済み/未解決質問記録/スコープ明確

## 重要原則

**DO**: イテレーティブに技法切替/対話重視/具体例で話す/曖昧さ排除/部分的形式化OK
**DON'T**: 線形フェーズ固執/完璧主義/一度に全部/技法単独使用/一人完結

## 参照

**子Skill**: `active-listening/SKILL.md`, `example-mapping/SKILL.md`, `formulation/SKILL.md`
**リファレンス**: `reference/gherkin-rules.md`, `reference/acceptance-criteria-templates.md`, `reference/collaboration-patterns.md`

## 制約

受入基準**作成**特化。実装/テストコード生成は別skill。技法は柔軟に使い分け。行き詰まり時は技法切替。大きいストーリーは分割検討。

---
*Matt Wynne Example Mapping, Gojko Adzic Specification by Example, Cucumber Gherkin, Carl Rogers Active Listeningに基づく*
