# 07. promptfooのファイル参照パス

**Index**: [README](./README.md) > 07-file-reference-paths

## 問題

最初の試み:
```yaml
prompts:
  - file://.claude/skills/bdd/example-mapping/SKILL.md
```

エラー:
```
ENOENT: no such file or directory, open '.claude/skills/bdd/example-mapping/SKILL.md'
```

## 根本原因

promptfooの`file://`参照は、**promptfooconfig.yamlが配置されているディレクトリ**を基準とする。

## ディレクトリ構造

```
<project-root>/
├── .claude/
│   └── skills/
│       └── bdd/
│           └── example-mapping/
│               └── SKILL.md
└── eval/
    ├── package.json
    └── test-deterministic/
        └── promptfooconfig.yaml  ← 基準ディレクトリ
```

## 相対パス計算

promptfooconfig.yaml から SKILL.md への経路:

```
test-deterministic/promptfooconfig.yaml
  ↓ ../
test-deterministic/../ (= eval/)
  ↓ ../
eval/../ (= dev-prompt-eval/)
  ↓ .claude/skills/bdd/example-mapping/
SKILL.md
```

相対パス: `../../.claude/skills/bdd/example-mapping/SKILL.md`

## 正しい設定

promptfooconfig.yaml:
```yaml
prompts:
  - file://../../.claude/skills/bdd/example-mapping/SKILL.md
```

## file://プロトコルの仕様

promptfooは以下の形式をサポート:

### 相対パス (推奨)
```yaml
prompts:
  - file://../../.claude/skills/bdd/example-mapping/SKILL.md
```

利点: ディレクトリ構造に依存しない

### 絶対パス (非推奨)
```yaml
prompts:
  - file:///absolute/path/to/project/.claude/skills/bdd/example-mapping/SKILL.md
```

問題: 環境依存、バージョン管理に不適

## デバッグ方法

### パスが正しいか確認

promptfooconfig.yamlの場所で:
```bash
ls ../../.claude/skills/bdd/example-mapping/SKILL.md
```

ファイルが見つかれば、パスは正しい。

### promptfooのログで確認

```bash
PROMPTFOO_LOG_LEVEL=debug pnpm eval:deterministic 2>&1 | grep "open"
```

promptfooが実際に開こうとしているパスが表示される。

## 複数ファイル参照

promptfooは複数のプロンプトファイルをサポート:

```yaml
prompts:
  - file://../../.claude/skills/bdd/example-mapping/SKILL.md
  - file://../../.claude/skills/bdd/formulation/SKILL.md
  - file://prompts/custom-prompt.md
```

promptfooは全ての組み合わせでテストを実行する（matrix方式）。

## ベストプラクティス

### ✅ 相対パスを使用
```yaml
prompts:
  - file://../../.claude/skills/bdd/example-mapping/SKILL.md
```

### ✅ promptsディレクトリ内も可
```yaml
prompts:
  - file://prompts/example-mapping.md
```

この場合、`test-deterministic/prompts/example-mapping.md`を参照。

### ❌ 絶対パスは避ける
```yaml
prompts:
  - file:///absolute/path/...  # 環境依存
```

## promptfoo実行時の作業ディレクトリ

promptfoo実行コマンド:
```bash
promptfoo eval --config test-deterministic/promptfooconfig.yaml
```

promptfooの内部動作:
1. カレントディレクトリから`test-deterministic/promptfooconfig.yaml`を読み込み
2. promptfooconfig.yamlのディレクトリ (`test-deterministic/`) を基準として相対パスを解決
3. プロンプトファイルを読み込み

つまり、`pnpm eval:deterministic`を`eval/`ディレクトリで実行しても、promptfoo内部では`test-deterministic/`が基準。

## まとめ

| 項目 | 内容 |
|------|------|
| 基準ディレクトリ | promptfooconfig.yamlの場所 |
| 推奨形式 | 相対パス |
| デバッグ方法 | `ls`コマンドで確認 |
| 複数ファイル | 配列で指定可能 |

## 関連する学び

- [03-prompt-design-principles.md](./03-prompt-design-principles.md) - `file://`参照を使う理由
- [09-debugging-tips.md](./09-debugging-tips.md) - パスエラーのデバッグ
