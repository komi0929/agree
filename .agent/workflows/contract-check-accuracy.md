---
description: 契約書チェック精度に関するドキュメントを確認・更新する
---

# 契約書チェック精度管理プロトコル

## チェック精度の重要性

**契約書チェック精度は、このサービスの存在意義そのものです。**

精度が低下すると：
- ユーザーが法的リスクを見逃す可能性がある
- 訴訟問題に発展するリスクがある
- サービスの信頼性が完全に失われる

## 必須チェック項目（28項目 + 拡張）

### 最重要項目（必ず検出すべき）

| 項目 | 実装ファイル | 概要 |
|------|------------|------|
| **支払期日（60日ルール）** | `payment-calculator.ts` | フリーランス新法第4条 |
| **著作権27条・28条の特掲** | `danger-patterns.ts` | 著作権法第61条第2項 |
| **損害賠償の上限** | `danger-patterns.ts`, `required-clauses.ts` | 無制限賠償の検出 + 上限条項の推奨 |
| **禁止行為** | `danger-patterns.ts` | フリーランス新法第5条 |
| **偽装請負リスク** | `danger-patterns.ts` | 指揮命令、勤務拘束の検出 |
| **競業避止義務** | `danger-patterns.ts` | 2年以上、広範囲の禁止 |
| **契約類型（請負/準委任）** | `required-clauses.ts` | 自動判定と説明 |
| **フリーランス新法7項目** | `required-clauses.ts` | 第3条の取引条件明示 |
| **検収期間** | `required-clauses.ts` | 長期検収の警告 + 期間推奨 |

### 欠落チェック項目（推奨条項）

- 支払期日の明確な規定
- 損害賠償の上限規定
- 著作権の帰属に関する規定
- 契約解除の条件
- 二次利用料の規定
- 追加作業の見積もり規定

## 精度に関するファイル

以下のファイルは精度に直接影響する：

| ファイル | 影響度 | 説明 |
|---------|-------|------|
| `lib/ai-service.ts` | **最重要** | AIプロンプト・解析ロジック |
| `app/api/analyze-stream/route.ts` | **重要** | ストリーミングAPI（同じプロンプト使用） |
| `lib/rules/rule-checker.ts` | **重要** | ルールベースチェック統合 |
| `lib/rules/danger-patterns.ts` | 高 | 危険パターン定義 |
| `lib/rules/required-clauses.ts` | 高 | 必須条項定義 |
| `lib/rules/recommended-clauses.ts` | 高 | 推奨条項定義 |
| `lib/rules/payment-calculator.ts` | 高 | 60日ルール計算 |
| `lib/knowledge/known-bad-patterns.ts` | 高 | 既知悪質パターン |
| `lib/rules/checkpoints-28.ts` | 中 | 28項目チェックポイントUI |

## 2026年1月 改善履歴

### ギャップ分析に基づく改善（2026年1月10日〜11日）

| タスクID | 内容 | 対象ファイル |
|---------|------|------------|
| IMP-S1 | フリーランス新法第3条「7項目チェック」 | `required-clauses.ts` |
| IMP-A1 | 契約類型（請負/準委任）の自動判定 | `required-clauses.ts` |
| IMP-A2 | 著作権27条・28条の特掲有無チェック | `danger-patterns.ts` |
| IMP-A3 | 損害賠償「上限」条項の有無チェック | `required-clauses.ts` |
| IMP-A4 | 検収期間の明記＆長さチェック | `required-clauses.ts` |
| IMP-A5 | 買いたたき検出パターン強化 | `danger-patterns.ts` |
| IMP-B1 | 二次利用料に関する規定チェック | `recommended-clauses.ts` |
| IMP-B2 | 追加作業の別途見積もり規定チェック | `recommended-clauses.ts` |
| IMP-B3 | 「Yes, But話法」交渉テンプレート | `message-crafter.tsx` |

## 精度変更時の確認事項

1. 同じ契約書で変更前後の検出件数を比較
2. 最重要項目が全て検出されることを確認
3. false negative（見逃し）がないことを確認
4. `npm run build`でビルドエラーがないことを確認

## 2026年1月7日のインシデント

Streaming API作成時にプロンプトを「簡略化」した結果：
- 検出件数: 10件超 → 3件に激減
- 原因: 詳細なチェック指示が省略されていた
- 対策: フルプロンプトに復元 + 保護ワークフロー作成
