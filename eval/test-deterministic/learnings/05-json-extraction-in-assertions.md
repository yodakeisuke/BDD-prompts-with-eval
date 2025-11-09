# 05. assertionでのJSON抽出

**Index**: [README](./README.md) > 05-json-extraction-in-assertions

## 問題

Claudeが時々markdown code blockを返す:

```
```json
{
  "story": { ... }
}
```
```

直接`JSON.parse(output)`すると失敗:
```
SyntaxError: Unexpected token ` in JSON at position 0
```

## 解決策: extractJSON()ユーティリティ

全てのJavaScript assertionで使用する標準パターン:

```javascript
function extractJSON(text) {
  const match = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  return match ? match[1].trim() : text.trim();
}
const jsonText = extractJSON(output);
const out = JSON.parse(jsonText);
```

## 正規表現の解説

```javascript
/```(?:json)?\s*\n?([\s\S]*?)\n?```/
```

| 部分 | 意味 |
|------|------|
| ` ``` ` | 開始のバッククォート3つ |
| `(?:json)?` | 任意の"json"識別子（非キャプチャ） |
| `\s*` | 任意の空白文字 |
| `\n?` | 任意の改行 |
| `([\s\S]*?)` | 任意の文字（改行含む）を最短マッチでキャプチャ |
| `\n?` | 任意の改行 |
| ` ``` ` | 終了のバッククォート3つ |

## promptfooconfig.yamlでの使用例

### defaultTestでの定義

```yaml
defaultTest:
  vars:
    task: "Example Mappingセッションをファシリテートし、構造化されたJSON形式で出力してください。"
  assert:
    - type: javascript
      value: |
        function extractJSON(text) {
          const match = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
          return match ? match[1].trim() : text.trim();
        }
        const jsonText = extractJSON(output);
        const out = JSON.parse(jsonText);

        // 構造検証
        const hasStory = out.story &&
          out.story.as_a && out.story.as_a.length > 0 &&
          out.story.i_want_to && out.story.i_want_to.length > 0 &&
          out.story.so_that && out.story.so_that.length > 0;

        return hasStory;
```

### 個別テストケースでの使用

```yaml
tests:
  - description: "Test case"
    vars:
      story_input: "予実差異レポートで、マイナス値を赤字で表示したい。"
    assert:
      - type: javascript
        value: |
          function extractJSON(text) {
            const match = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
            return match ? match[1].trim() : text.trim();
          }
          const out = JSON.parse(extractJSON(output));

          // カスタム検証
          const criticalQuestions =
            out.questions.blocker.length +
            out.questions.clarification.length;
          return criticalQuestions >= 3;
```

## 重要な原則

### ✅ 全てのassertionで使用

```javascript
// 毎回extractJSON()を呼ぶ
const out = JSON.parse(extractJSON(output));
```

理由:
- Claudeの出力は一貫性がない
- 時々markdown blockを返す
- defensive programming

### ❌ 条件分岐で対応しない

```javascript
// アンチパターン
let jsonText;
if (output.startsWith('```')) {
  jsonText = output.match(/```json\n([\s\S]*?)\n```/)[1];
} else {
  jsonText = output;
}
```

理由:
- コードが複雑
- 全てのケースをカバーできない
- `extractJSON()`で統一的に処理できる

## DRY原則違反の許容

promptfooconfig.yamlでは、各assertionで`extractJSON()`を再定義する:

```yaml
assert:
  - type: javascript
    value: |
      function extractJSON(text) { ... }  # 定義1
      ...
  - type: javascript
    value: |
      function extractJSON(text) { ... }  # 定義2（重複）
      ...
```

なぜ重複を許容するか:
- promptfooの各assertionは独立して実行される
- グローバル変数や共有関数の定義方法がない
- 数行のユーティリティなので許容範囲

## テストパターン集

### パターン1: 構造検証

```javascript
function extractJSON(text) {
  const match = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  return match ? match[1].trim() : text.trim();
}
const out = JSON.parse(extractJSON(output));

const hasValidStructure =
  out.story && out.rules && out.questions && out.metadata;
return hasValidStructure;
```

### パターン2: カウント検証

```javascript
function extractJSON(text) {
  const match = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  return match ? match[1].trim() : text.trim();
}
const out = JSON.parse(extractJSON(output));

const totalQuestions =
  out.questions.blocker.length +
  out.questions.clarification.length;
return totalQuestions >= 3;
```

### パターン3: キーワード検証

```javascript
function extractJSON(text) {
  const match = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  return match ? match[1].trim() : text.trim();
}
const out = JSON.parse(extractJSON(output));

const allQuestions = [
  ...out.questions.blocker,
  ...out.questions.clarification
].join(' ');

const hasRelevantKeywords =
  allQuestions.includes('マイナス') &&
  allQuestions.includes('赤字');

return hasRelevantKeywords;
```

## エラーハンドリング

assertionでJSON.parse()が失敗した場合、promptfooが自動的にfailとして記録:

```
Custom function must return a boolean, number, or GradingResult object.
Got type undefined
```

これはデバッグに役立つため、try-catchでラップしない。

## まとめ

| 原則 | 理由 |
|------|------|
| 全assertionでextractJSON()使用 | 一貫性と堅牢性 |
| DRY違反を許容 | promptfooの制約 |
| エラーハンドリングしない | promptfooの自動フェイルが有用 |
| 正規表現を統一 | メンテナンス性 |

## 関連する学び

- [04-forcing-json-output.md](./04-forcing-json-output.md) - そもそもmarkdown blockを防ぐ
- [09-debugging-tips.md](./09-debugging-tips.md) - assertion失敗時のデバッグ
