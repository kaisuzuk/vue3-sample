# 地図＋サイドバー編集画面 CDD設計ドキュメント（案）

## 1. 目的と範囲

本ドキュメントは「地図上に区画（ポリゴン）を描画し、クリックでサイドバーを開いて編集・登録する画面」に対して、コンポーネント駆動開発（CDD）を適用するための設計指針をまとめる。

対象となる要素は以下。

* Google Map の表示
* 区画（ポリゴン）の描画（色分け、選択中のハイライト）
* ポリゴン/マーカーのクリックイベント
* 右サイドバーの編集フォーム（状態、アラーム日時、メモなど）
* 登録・キャンセルの画面操作
* API連携（一覧取得、更新登録、エラー処理）
* MSWを使った単体検証（サイドバー中心）

---

## 2. この画面が複雑になる理由（最重要）

この画面では「宣言的UI（Vue）」と「命令的UI（Google Maps API）」が混在する。

* Vue側は「状態がこうならUIはこう」という宣言的な構造が得意
* Maps側は「ポリゴンを作れ、色を変えろ、イベントを貼れ」という命令的な操作が中心

この2つを直結すると、Mapコンポーネントが巨大化しやすく、以下の問題が起きる。

* if文が散らばり、表示条件が追えない
* Mapイベントとフォームロジックが混ざる
* API結果の反映処理が肥大化する
* テストが困難になる

したがって設計の基本方針は次の通り。

「Google Maps は外部I/O（外界）として隔離し、Vue側は状態遷移で記述する」

---

## 3. 設計方針（結論）

本画面では以下を徹底する。

1. 状態の真実は feature/model に集約する
2. UIは props で受け取り、emit で返す（props down / events up）
3. Google Maps API を直接触るコードは shared/map に隔離する
4. 描画は「データ（宣言的）」として model が返し、adapter が命令的に反映する
5. 地図とフォームの複雑さを混ぜない（セクション分割する）

---

## 4. 採用する構成（この画面版）

### 構造（最小構成ベース）

* pages：画面入口（ルート・遷移のみ）
* widgets：画面骨格（Map領域＋サイドバー）
* sections：サイドバー内の入力ブロック（表示と入力のみ）
* features/model：状態・導出値・操作（API呼び出し含む）
* entities：ドメイン型・バリデーション（純関数）
* shared/map：Google Maps への命令的操作（外界隔離）

### ファイル案

* pages/water-map/WaterMapPage.vue
* widgets/water-map/ui/WaterMapWidget.vue
* widgets/water-map/ui/MapCanvas.vue（Mapを貼るだけのラッパ）
* widgets/water-map/ui/SidebarPanel.vue（見た目枠）
* widgets/water-map/ui/sections/WaterControlSection.vue（状態：入水/出水/止水）
* widgets/water-map/ui/sections/AlarmSection.vue（アラーム日時）
* widgets/water-map/ui/sections/MemoSection.vue（メモ）
* features/water-map/model/useWaterMap.ts
* features/water-map/api/waterMapApi.ts
* entities/field/types.ts（区画、ID、状態など）
* entities/field/validateWaterControl.ts
* shared/map/GoogleMapAdapter.ts
* shared/map/types.ts
* shared/map/style.ts
* shared/ui/DateInput.ts 等

---

## 5. 役割分担（何をどこに書くか）

### pages（WaterMapPage）

役割：

* ルーティング入口
* 初期ロードをキックする（widget側で呼んでもよいが統一する）
* 保存成功時の遷移（必要なら）

禁止：

* Mapイベント処理
* フォームロジック
* API直呼び（基本は model 経由）

---

### widgets（WaterMapWidget）

役割：

* 画面レイアウト（Map領域＋サイドバー）
* useWaterMap を呼んで state/view/actions を取得
* view を sections に配布
* sections の emit を actions に流す

許可：

* 表示のための最小限の条件分岐（例：sidebarOpenなら表示）

禁止：

* ドメイン判断のif（例：状態=入水なら…の業務条件分岐をベタ書き）
* API呼び出しの詳細実装

---

### sections（サイドバー各ブロック）

役割：

* 表示と入力だけ
* props：値、エラー、disabled、loading
* emits：update、submit、cancel など

禁止：

* API
* Map操作
* 状態の整合処理（人数に応じた配列調整のようなもの）

例：
WaterControlSection は「入水/出水/止水」を選ぶUIを提供するが、「どの状態が選択可能か」「選択したらどう整合を取るか」は model 側が決める。

---

### features/model（useWaterMap）

役割：

* 画面状態の唯一の真実
* Map表示のための導出値（polygonsToRender 等）
* サイドバー編集用の draft 管理
* バリデーション結果（errors）
* API呼び出し（load/update）

useWaterMap が返す形（固定）：

* state：選択ID、sidebarOpen、mode（idle/editing/submitting/error）
* view：描画用ポリゴン、選択中の区画情報、フォームに渡す値
* errors：フォーム各項目のエラー
* actions：selectField / openSidebar / updateDraft / submit / cancel / reload

重要：UIは state/view を見て描画し、更新は actions のみで行う。

---

### shared/map（GoogleMapAdapter）

役割：

* Google Maps API への命令的操作をすべて引き受ける
* ポリゴン作成/更新/削除
* クリックイベント購読
* Mapインスタンス、Overlayの参照管理

重要：Vueコンポーネントから Google Maps API を直に触らない。

インターフェース例（イメージ）：

* mount(containerEl)
* setPolygons(polygonsToRender)
* setSelected(polygonId)
* onPolygonClick(callback)
* destroy()

---

### entities（Field / WaterControl など）

役割：

* ドメイン型（FieldId, WaterStatus 等）
* バリデーション（純関数）
* DTO→Domain の変換（必要なら）

UI・Map・APIに依存しない。

---

## 6. データフロー（一本道）

この画面の重要イベント「ポリゴンをクリックしてサイドバー表示」の流れ。

1. adapter がポリゴンクリックを受け取る
2. adapter → actions.selectField(fieldId) を呼ぶ
3. useWaterMap が state.selectedFieldId / sidebarOpen / mode を更新
4. widget が state/view を見てサイドバーを表示
5. sections が view.selectedField / draft / errors を受けて描画

サイドバーでの入力は：

1. section が emit(update) を発火
2. widget が actions.updateDraft(patch) を呼ぶ
3. model が draft を更新し errors を再計算
4. UIは view/errors を再描画

登録ボタンは：

1. section → emit(submit)
2. widget → actions.submit()
3. model が submitting にし API を呼ぶ
4. 成功：stateを更新し、必要なら再ロード
5. 失敗：error を state に載せて表示

---

## 7. モード設計（状態機械っぽくする）

複雑さを減らすために mode を導入する。

* idle：選択なし（初期）
* selected：選択あり（閲覧状態）
* editing：サイドバーで編集中（draftあり）
* submitting：登録中
* error：登録エラー（再試行可能）

UIは mode に従って表示を切り替える。条件分岐は「modeを見る」に集約し、業務条件分岐を散らさない。

---

## 8. CDD（Storybook）運用方針

### Storybook対象（必須）

* sections（WaterControlSection / AlarmSection / MemoSection）
* shared/ui（入力部品）

ここは状態パターンをストーリー化して固定する。

例：

* WaterControlSection：通常、disabled、エラーあり
* AlarmSection：未入力、入力済、形式エラー
* MemoSection：長文、未入力
* SidebarPanel：選択なし/選択あり/送信中/エラー

### Storybookで無理しない

* Google Map の完全再現（重い、キー、環境依存）

代替：

* MapAdapter をモックして「クリックが来た」ことにするストーリーを作る
* Map統合の保証は E2E（Playwright）に寄せる

---

## 9. MSW運用方針（API分離）

MSWは features/api を通じた HTTP を横取りし、成功/失敗/遅延を再現する。

* load：区画一覧取得（色分け用の状態も含む）
* submit：更新登録（200/400/500/timeout）

重要：UIはAPI結果を直接解釈せず、model が view に整形する。

---

## 10. よくあるアンチパターン（禁止）

* widget/section 内で Google Maps API を直接触る
* section が API を呼ぶ
* Mapのクリック処理で UI を直接操作（DOM操作等）
* ポリゴン描画ロジックが UI コンポーネントに散る
* 選択状態・編集中状態が複数箇所で二重管理される

---

## 11. 実装時のチェックリスト（レビュー用）

* Google Maps API を触っている場所は shared/map のみか
* 状態の真実は useWaterMap に集約されているか
* UIコンポーネントが form を直接更新していないか（actions 経由か）
* sections は props/emit だけで説明できるか
* mode によってUI切替が整理されているか
* API結果の整形が model で完結しているか
* Storybookで section の状態違いが確認できるか

---

## 12. まとめ

この画面の成功要因は次の3点。

1. Google Maps を外界として隔離する（Adapter必須）
2. 状態遷移でUIを描く（modeとviewで統一）
3. サイドバーは通常フォームと同じく section 化してCDD運用する
