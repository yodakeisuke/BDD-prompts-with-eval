# 02. permission_modeの副作用

**Index**: [README](./README.md) > 02-permission-mode

## 問題

`permission_mode: plan`を設定した状態で、以下のような会話形式の出力が返された:

```
I'll help you facilitate Example Mapping sessions! This skill helps teams...
```

期待: JSON形式の出力
実際: 説明的で親切な会話調の応答

## 根本原因

`permission_mode: plan`はユーザー承認を必要とする対話モードのため、Claudeが「説明的で親切な」振る舞いをデフォルトとする。

promptfooconfig.yaml:
```yaml
providers:
  - id: anthropic:claude-agent-sdk
    config:
      model: sonnet
      working_dir: ./sandbox
      permission_mode: plan  # これが原因
      setting_sources:
        - project
```

## Claude Agent SDKの動作モード

### `permission_mode: plan`の場合
- ツール使用前にユーザーに計画を提示
- 対話的で説明的な応答
- プロンプトの「JSON出力のみ」指示よりも対話モードが優先される

### `permission_mode`なしの場合
- プロンプトの指示に忠実
- JSON出力要求に素直に従う
- deterministic testに適している

## 解決策

**deterministic testでJSON出力が必要な場合は、`permission_mode`を設定しない**

promptfooconfig.yaml (修正後):
```yaml
providers:
  - id: anthropic:claude-agent-sdk
    config:
      model: sonnet
      working_dir: ./sandbox
      # permission_mode: plan  # 削除 - 会話形式出力の原因
      setting_sources:
        - project
```

## 結果

修正前: 0/3 pass (全て会話形式の出力)
修正後: 3/3 pass (全てJSON形式の出力)

## いつ`permission_mode: plan`を使うべきか

### 適切なケース
- **対話型スキル**: ユーザーとの会話が主目的
- **ツール使用の透明性**: ファイル操作やAPI呼び出しの承認が必要
- **手動テスト**: 人間が介入しながら動作を確認

### 不適切なケース
- **deterministic test**: 一貫したJSON出力が必要
- **自動化されたevaluation**: ユーザー介入なしで完結すべき
- **qualitative test**: LLM-as-judgeで評価する場合

## コメントの書き方

設定を削除する際は、理由をコメントで残す:

```yaml
# permission_mode: plan  # Removed - plan mode causes conversational output instead of pure JSON
```

これにより:
1. 意図的に削除したことが明確
2. 将来の混乱を防ぐ
3. 再度有効化する際の判断材料

## 参考リンク

- [Claude Agent SDK Documentation](https://github.com/anthropics/anthropic-sdk-typescript)

## 関連する学び

- [04-forcing-json-output.md](./04-forcing-json-output.md) - JSON出力の確実な方法
- [08-test-driven-prompt-development.md](./08-test-driven-prompt-development.md) - テストタイプ別の設定
