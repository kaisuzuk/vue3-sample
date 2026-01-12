# Vue2 → Vue3 マイグレーションプロジェクト
## 進め方・設計方針 引き継ぎドキュメント（Copilot向け・完全版）

---

## 0. このドキュメントの目的

このドキュメントは以下を目的とする。

- Vue2 → Vue3 マイグレーションを **複数人（社員 + BP）で安全に進める**
- 設計思想・責務分離・禁止事項を **規約として固定する**
- GitHub Copilot に読み込ませることで
  - 不適切な実装
  - 旧Vue2的な設計への逆戻り
  - MSW / DTO / Store の誤用
  を **生成段階で防ぐ**

本ドキュメントは「人間にとっての簡潔さ」よりも、
**AI（GitHub Copilot）が設計意図・制約・背景を誤解しないこと**を最優先する。

---

## 1. プロジェクトの前提条件

### 1.1 技術前提

- 既存フロントエンド：Vue2
- 新フロントエンド：Vue3 + TypeScript + Composition API
- 移行期間中は **Vue2 / Vue3 を同一リポジトリで共存**させる
- パッケージ管理：pnpm（workspace 利用）
- バックエンド：.NET 8（Controller ベース）
- Swagger (/swagger, /swagger/v1/swagger.json) が出る環境が存在する

---

## 2. 最重要な設計思想（違反禁止）

### 2.1 責務分離を最優先する

以下の責務を **絶対に混在させてはならない**。

- UI 表示
- ビジネスロジック
- API 通信
- API 契約（DTO）

### 2.2 DTO は「外部契約」である

- DTO は **API レスポンス構造をそのまま表現した型**である
- フロントエンド都合を **一切反映してはならない**

禁止例：

- optional 化
- UI 向けプロパティ追加
- 命名変更
- 表示用に加工した型定義

UI に都合の良い形は **ViewModel / Presentation Model** を別途定義する。

---

## 3. リポジトリ構成（概念）

```txt
repo-root/
├─ fe-libs/                  # Vue2 / Vue3 共通ライブラリ（workspace package）
│  ├─ mocks/                 # MSW モック定義
│  ├─ types/                 # API DTO 型定義（OpenAPI 生成）
│  ├─ openapi/               # swagger.json
│  ├─ scripts/               # OpenAPI 取得・生成スクリプト
│  └─ package.json
│
├─ vue2-app/
│  └─ src/
│     └─ mocks/              # MSW 初期化（Vue2 用）
│
├─ vue3-app/
│  └─ src/
│     └─ mocks/              # MSW 初期化（Vue3 用）
```

---

## 4. fe-libs の位置づけ

### 4.1 fe-libs は workspace package

- pnpm workspace によって管理される
- Vue2 / Vue3 双方から同一 import パスで参照する

```ts
import type { components } from '@fe-libs/types'
import { handlers } from '@fe-libs/mocks'
```

### 4.2 fe-libs に置いてよいもの

- API 契約（DTO）
- MSW の **定義のみ**（handlers / fixtures）
- UI / フレームワーク非依存コード

### 4.3 fe-libs に置いてはいけないもの

- Vue 依存コード
- MSW の初期化処理（setupWorker / worker.start）
- アプリ固有ロジック

---

## 5. MSW（Mock Service Worker）設計方針【最重要】

### 5.1 MSW 共通化の目的

- Vue2 / Vue3 で **同一 API モックを使用**する
- モック定義の二重管理を防止
- API 仕様理解の共通言語とする
- BP が UI 実装なしで貢献できる領域を作る

---

### 5.2 MSW の共通化範囲

#### fe-libs/mocks に置くもの（共通化）

```txt
fe-libs/mocks/
├─ handlers/
│  ├─ items.handlers.ts
│  ├─ users.handlers.ts
│  └─ index.ts
├─ fixtures/
│  ├─ items.ts
│  └─ users.ts
├─ scenarios/
│  ├─ success.ts
│  ├─ error.ts
│  └─ index.ts
└─ index.ts
```

- request → response の定義
- 正常系 / 異常系レスポンス
- fixture データ

#### 各アプリ側に置くもの（共通化しない）

```txt
vue2-app/src/mocks/initMsw.ts
vue3-app/src/mocks/initMsw.ts
```

- setupWorker()
- worker.start()
- 環境判定（dev / test）

---

### 5.3 MSW 初期化を共通化しない理由

- Vue2 / Vue3 でビルド・起動方式が異なる
- polyfill / bundler 差異が存在する
- 共通化するとどちらかが壊れる可能性が高い

**共通化するのは定義まで。実行は各アプリで行う。**

---

### 5.4 MSW の役割と禁止事項

MSW の役割：

- API 仕様の再現
- 正常系 / 異常系の再現
- フロント単体での動作確認

禁止事項：

- UI 表示条件のテスト
- 内部ロジックの検証
- 本番仕様と異なるレスポンス

---

### 5.5 BP 向け MSW タスク

BP に任せてよい作業：

- handlers 作成
- fixture 作成
- 正常系 / エラー系レスポンス追加

BP に任せてはいけない作業：

- MSW 初期化
- scenario 切り替え設計
- アプリ起動制御

---

## 6. API DTO 設計（OpenAPI 自動生成）

### 6.1 基本方針

- OpenAPI（swagger.json）を **唯一の正**とする
- DTO は **自動生成**し、手書きしない

---

### 6.2 fe-libs/types 構成

```txt
fe-libs/types/
├─ generated/          # OpenAPI から自動生成（編集禁止）
│  └─ openapi.d.ts
├─ index.ts
```

- generated 配下は編集禁止
- DTO を変更したくなった場合は API 契約の問題

---

### 6.3 DTO 使用ルール

```ts
type ItemDto = components['schemas']['ItemDto']
```

禁止：

- DTO の加工
- UI 用変形
- optional 化

---

## 7. レイヤー別責務

### 7.1 API 層（features/*/api）

- DTO をそのまま返す
- 通信処理のみ

### 7.2 Model 層（features/*/model）

- DTO → ViewModel 変換
- ビジネスルール

### 7.3 UI 層（features/*/ui）

- ViewModel のみ扱う
- DTO を import してはいけない

---

## 8. 状態管理（Pinia）

### 8.1 Store 使用判断

- 複数コンポーネントで共有するか
- 画面をまたいで生存するか

YES の場合のみ Store。

### 8.2 Store 禁止事項

- API 通信
- DTO 保持
- 複雑なロジック

---

## 9. コンポーネント設計

### 9.1 shared/ui

- 想定した自由度のみ許可
- 無制限なスタイル調整は禁止

### 9.2 イベント設計

- 子 → 親は emit
- 動詞 + 名詞
- payload.type で分岐しない

---

## 10. テスト思想

- テスト対象は外部から観測可能な振る舞いのみ
- private 関数はテストしない
- API はスタブ
- モック呼び出し回数検証は原則禁止

---

## 11. 移行フェーズ

### Phase 1

- fe-libs 整備
- MSW handlers 作成
- DTO 自動生成

### Phase 2

- feature/api, model 実装
- Storybook 中心で UI 構築

### Phase 3

- pages / widgets 組み立て
- 実画面接続

---

## 12. Copilot 用最重要ルール（要約）

- DTO を UI 用に加工するな
- MSW 初期化を fe-libs に置くな
- API 通信を Store に書くな
- UI とロジックを混ぜるな
- props で足りるなら Store を使うな
- fe-libs は契約・定義専用

---

（このファイルは GitHub Copilot への引き継ぎを目的として作成されている）

