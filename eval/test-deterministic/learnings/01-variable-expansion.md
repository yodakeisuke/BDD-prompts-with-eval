# 01. promptfooの変数展開メカニズム

**Index**: [README](./README.md) > 01-variable-expansion

## 問題

SKILL.mdファイル内で`{{story_input}}`変数を参照したが、Claude Agentが文字列として認識し、JSON出力モードに切り替わらなかった。

最初の試み:
```markdown
When {{story_input}} variable is provided, output JSON...
```

結果: Claude Agentが「story_input変数は提供されていません」といった会話を返した。

## 根本原因

promptfooの変数展開タイミングと仕組みを理解していなかった。

## 解決策

**promptfooはNunjucksテンプレートエンジンを使用し、`file://`で読み込まれたプロンプトファイル内でも変数展開が行われる**

### promptfooの処理順序

```
1. ファイル読み込み
   ↓
   file://../../.claude/skills/bdd/example-mapping/SKILL.md

2. 変数展開 (Nunjucks)
   ↓
   {{story_input}} → "予実差異レポートで、マイナス値を赤字で表示したい。"

3. LLM実行
   ↓
   展開後のプロンプトをClaude Agent SDKに送信
```

### 正しい使い方

promptfooconfig.yaml:
```yaml
prompts:
  - file://../../.claude/skills/bdd/example-mapping/SKILL.md

tests:
  - description: "Test case"
    vars:
      story_input: "予実差異レポートで、マイナス値を赤字で表示したい。"
```

SKILL.md:
```markdown
# Example Mapping Skill

User Story: {{story_input}}

Analyze the above user story...
```

**重要**: `{{story_input}}`と書くだけで、promptfooが自動的に`vars`の値に置き換える。

## Nunjucksの機能

promptfooは完全なNunjucksテンプレートをサポート:

### 基本的な変数展開
```markdown
Hello {{name}}
```

### フィルター
```markdown
{{message | upper}}
```

### 条件分岐
```markdown
{% if premium %}
Premium support: {{query}}
{% endif %}
```

### ループ
```markdown
{% for item in items %}
- {{item}}
{% endfor %}
```

## デバッグ方法

変数が正しく展開されているか確認するには:

```bash
PROMPTFOO_LOG_LEVEL=debug pnpm eval:deterministic
```

ログに展開後のプロンプト全文が表示される。

## よくある誤解

❌ **間違い**: 「`{{story_input}}`は実行時に値が存在するかチェックする必要がある」
```markdown
{% if story_input %}
  User Story: {{story_input}}
{% endif %}
```

✅ **正解**: promptfooが展開するため、常に値が存在する（空文字列の場合もある）
```markdown
User Story: {{story_input}}
```

## 参考リンク

- [promptfoo Variables Documentation](https://www.promptfoo.dev/docs/configuration/parameters/)
- [Nunjucks Templating](https://mozilla.github.io/nunjucks/)

## 関連する学び

- [03-prompt-design-principles.md](./03-prompt-design-principles.md) - 条件分岐は不要という原則
- [07-file-reference-paths.md](./07-file-reference-paths.md) - `file://`プロトコルの使い方
