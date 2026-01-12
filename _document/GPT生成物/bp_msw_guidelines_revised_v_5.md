# BP向けガイド：MSW（Mock Service Worker）実装ルール（改訂版 v5）

このドキュメントは、Vue2 → Vue3 マイグレーションプロジェクトにおいて、
**BPメンバーが MSW（Mock Service Worker）および API DTO 定義・動作確認までを、安全かつ設計意図どおりに進めるための専用ガイド**です。

UI 実装や本番コードの知識は前提としません。
**API仕様（Swagger / OpenAPI）を読み、正しくモック・DTO・確認用設定を用意すること**が役割です。

---

## 1. MSWとは何か（このプロジェクトでの位置づけ）

MSW（Mock Service Worker）は、
**フロントエンドから呼び出される API 通信を、ブラウザレベルで横取りし、
あらかじめ定義したレスポンスを返す仕組み**です。

このプロジェクトでは MSW を以下の目的で使用します。

- API の仕様をフロントエンド側で再現する
- 正常系・異常系・境界値の動作確認を可能にする
- Vue2 / Vue3 の両プロジェクトで同一モックを使う

---

## 2. BPが担当する範囲（重要）

### 2.1 BPがやってよいこと

- API仕様（Swagger / OpenAPI 定義）を読む
- MSW の **handler** を作成する
- **fixture（レスポンスデータ）を作成する**
- **正常系・異常系レスポンスを定義する**
- **Swagger（OpenAPI）定義から DTO 型定義を生成・更新する**
- **MSW動作確認用 Harness への登録作業を行う**（※範囲限定）

### 2.2 BPがやってはいけないこと

- MSW の初期化処理を書くこと
- `setupWorker()` / `worker.start()` を触ること
- Vue の本番画面・コンポーネントを編集すること
- モックレスポンスを UI 都合で変更すること
- DTO（生成物）を手で編集すること
- Harness の UI 構造・切替ロジックを変更すること

> **注意**：  
> MSW・DTO・fixture は「API 契約の再現」です。  
> 表示や画面都合で形を変えてはいけません。

---

## 3. ディレクトリ構成（BPが触ってよい場所）

```txt
fe-libs/
├─ mocks/                 # MSW モック定義（BPの主戦場）
│  ├─ handlers/           # APIごとの handler
│  ├─ fixtures/           # レスポンス用データ
│  ├─ scenarios/          # handlerセット（切り替え用定義）
│  └─ index.ts
│
├─ types/                 # API DTO 型定義
│  ├─ generated/          # OpenAPI から自動生成（編集禁止）
│  │  └─ openapi.d.ts
│  └─ index.ts            # export 集約（原則編集不要）
│
├─ openapi/               # Swagger / OpenAPI 定義（swagger.json 等）
└─ scripts/               # DTO 生成用スクリプト

vue3-app/src/
├─ devtools/msw-harness/  # MSW 動作確認用（dev-only）
│  ├─ scenarioRegistry.ts # ★ BPが編集可（登録のみ）
│  ├─ apiCatalog.ts       # ★ BPが編集可（登録のみ）
│  └─ MswHarnessPage.vue  # 社員のみ編集可
```

---

## 4. Swagger（OpenAPI）→ DTO 型定義の作業

### 4.1 DTO の考え方（最重要）

- DTO は **API が実際に返す構造をそのまま表現した型**
- フロントエンド都合は一切反映しない
- UI 用の加工は別レイヤーで行う

### 4.2 DTO 更新手順（BP作業）

1. Swagger UI / swagger.json を確認
2. `fe-libs/openapi/swagger.json` を最新化
3. 以下を実行

```bash
pnpm gen:types
```

4. `fe-libs/types/generated/openapi.d.ts` の差分を確認

### 4.3 DTO に関する禁止事項

- `openapi.d.ts` を直接編集する
- optional / null をフロント都合で追加する
- プロパティ名を変更する
- UI 表示用の型を DTO に混ぜる

---

## 5. fixture の書き方

fixture は **「API が実際に返すレスポンスデータそのもの」**です。

### 5.1 fixture の基本ルール

- API レスポンス構造と **完全一致**させる
- UI に都合の良い形にしてはいけない
- データを省略・簡略化しない
- プロパティ名・型・階層を Swagger 定義と揃える

### 5.2 fixture（TS）例

```ts
// fe-libs/mocks/fixtures/items.normal.ts

export const itemsNormal = [
  { id: '1', name: 'Item A', price: 100 },
  { id: '2', name: 'Item B', price: 200 }
]
```

empty / 境界値 / 大量データ用の fixture も、
**レスポンス構造は同じまま、データ量・値だけを変える**ようにしてください。

---

### 5.3 例外：バグ再現用 fixture は JSON を許可する

結合テスト等で発生した UI バグを確実に再現するために、
**実際のレスポンス body（JSON）をそのまま fixture として保存したい**場合があります。

この用途に限り、fixture を **JSON ファイルとして保存することを例外的に許可**します。

- 目的：**「実データをそのまま使って再現する」**
- 注意：UI 都合で改変しない（実データの写しとして扱う）

推奨命名（例）：

- `fe-libs/mocks/fixtures/bugs/bug-12345.items.json`
- `fe-libs/mocks/fixtures/bugs/bug-12345.order.json`

> JSON を使うのは **「bug再現」などの例外ケースに限定**し、
> 通常の fixture は TS を基本とします。

---

### 5.4 許可：境界値・大量データは fixture 配下での動的生成を可

境界値テストや大量データによる表示・性能確認では、
**ループ（Array.from 等）でデータを動的生成**したほうが、

- 修正しやすい
- 意図が明確
- 視認性が高い

という利点があります。

この用途に限り、**fixture ファイル内でのみ**動的生成を許可します。

**ルール**：

- 動的生成は **fixtures 配下だけ**で行う（handler 内は禁止）
- 乱数・現在時刻など、再現性を壊す要素は使わない
- 生成ロジックは単純に保つ（レビューしやすく）

例：大量データ

```ts
// fe-libs/mocks/fixtures/items.large.ts

export const itemsLarge = Array.from({ length: 500 }, (_, i) => ({
  id: String(i + 1),
  name: `Item ${i + 1}`,
  price: (i + 1) * 10,
}))
```

---

## 6. 異常系レスポンスの定義

異常系レスポンスは **必ず API 仕様に基づいて**定義します。

### 6.1 400 / 404 / 409 など（エラーレスポンスあり）

```ts
export const getItemsBadRequestHandler = http.get('/api/items', () => {
  return HttpResponse.json(
    { message: 'Bad Request' },
    { status: 400 }
  )
})
```

- ステータスコードは必ず明示する
- エラーレスポンスの body がある場合は仕様どおり返す

---

### 6.2 500 Internal Server Error（body なし）

```ts
export const getItemsServerErrorHandler = http.get('/api/items', () => {
  return new HttpResponse(null, { status: 500 })
})
```

- body がない場合は `null` を返す
- 勝手にエラー用 JSON を作らない

---

## 7. scenario（シナリオ）とは何か【重要】

### 7.0 シナリオ命名ルール（追加）

シナリオは「用途」が分かる名前を付けます。

- 通常用途：`normal` / `empty` / `large` / `boundary` / `error`
- **バグ再現用途（例外）**：`bug-{障害No}`（例：`bug-12345`）

バグ再現シナリオでは、`fixtures/bugs/` 配下の **実レスポンス JSON** を使用して再現性を最優先します。

---


### 7.1 scenario の正体

**scenario とは、「どの handler を“まとめて有効にするか”を定義するためのものです。**

- handler：**1API・1パターンの振る舞い（正常／empty／異常など）**
- scenario：**handler のセット（配列）**

scenario は API の振る舞いを実装しません。
**handler をまとめるだけ**の存在です。

---

### 7.2 scenario 定義の具体例（BPが作ってよい最大範囲）

```ts
// fe-libs/mocks/scenarios/items.scenarios.ts

export const itemsScenarios = {
  normal: [getItemsNormalHandler],
  empty: [getItemsEmptyHandler],
  large: [getItemsLargeHandler],
  boundary: [getItemsBoundaryHandler],
  error: [getItemsServerErrorHandler],
} as const
```

このファイルでやってよいこと：

- handler を並べる
- 名前（normal / empty / error など）を付ける

---

### 7.3 scenario でやってはいけないこと

- if / switch などの条件分岐を書く
- 状態を持つ（変数・フラグなど）
- 切り替えロジックを書く
- URL / クエリ / トグルを読む

切り替え方法の設計は **社員（基盤側）の責務**です。

---

## 8. MSW 動作確認（Harness）について【重要】

BP は **モックを呼ぶ側（本番画面）を編集せず**、
以下の方法で MSW の動作確認を行います。

### 8.1 Harness の役割

- dev-only の確認ページ（例：`/dev/msw`）
- scenario を切り替えて API を直接実行
- レスポンス JSON / status を可視化

### 8.2 BPが編集してよい Harness ファイル（限定）

- `scenarioRegistry.ts`：scenario の登録のみ
- `apiCatalog.ts`：確認したい API の登録のみ

※ UI 本体・切替ロジック・ルーティングは社員管理

---

## 9. BP向け最重要まとめ

- MSW は API 契約の再現である
- handler はパターンごとに複数作ってよい
- fixture は API レスポンスをそのまま表現する
- scenario は handler をまとめるだけ
- DTO は OpenAPI から生成する
- 生成物（DTO）は手で編集しない
- 切り替え・初期化・UI は社員側が担当
- BPは **定義と登録まで**を担当
- 切替ロジック・UI構造は社員が管理
- Harness を使って自己完結で動作確認可能
- MSW を擬似バックエンドにしない

---

（このドキュメントは BP メンバー向け MSW / DTO / 動作確認ガイドである）

