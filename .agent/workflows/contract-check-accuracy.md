---
description: 契約書チェック精度に関するドキュメントを確認・更新する
---

# 契約書チェック精度ログの確認・更新

このワークフローは、契約書チェックの精度向上に関する恒久的なドキュメントにアクセスするためのものです。

## 1. メインドキュメントの確認

精度向上に関するすべての設計判断、実装履歴、検討事項は以下のファイルに記録されています：

```
.agent/CONTRACT_CHECK_ACCURACY_LOG.md
```

このファイルには以下が含まれます：
- 設計思想と根本原則
- アーキテクチャ変遷（バージョン履歴）
- 実装履歴（各機能の意図と設計判断）
- 検討したが採用しなかったアイデア
- 既知の課題と将来の改善候補

## 2. 関連する実装ファイル

### Layer 1: ルールベースチェック
- `lib/rules/danger-patterns.ts` - 危険パターン正規表現
- `lib/rules/required-clauses.ts` - 必須条項存在チェック
- `lib/rules/payment-calculator.ts` - 60日ルール計算
- `lib/rules/rule-checker.ts` - 統合チェッカー

### 既知パターンDB
- `lib/knowledge/known-bad-patterns.ts` - 悪質パターンデータベース

### Layer 2-3: 法律適用判定 + LLM
- `lib/types/user-context.ts` - ユーザー属性定義
- `lib/legal/law-applicability.ts` - 法律適用判定ロジック
- `lib/ai-service.ts` - LLM解析（動的プロンプト）

### Layer 4: 結果統合
- `lib/legal/result-merger.ts` - ルール+LLM結果マージ

## 3. 改善を行った場合のルール

1. **必ず `.agent/CONTRACT_CHECK_ACCURACY_LOG.md` に追記する**
   - 「実装履歴」セクションに日付、意図、設計判断を記録
   - 検討したが採用しなかったアイデアも記録

2. **コード内にもコメントを残す**
   - `// [精度向上ログ: YYYY-MM-DD]` の形式で記載

3. **パターン追加時**
   - `danger-patterns.ts` または `known-bad-patterns.ts` に追加
   - 検知意図と法的根拠を明記
