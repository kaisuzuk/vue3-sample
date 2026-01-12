# Storybook 解説資料

（Vueマイグレーション／CDD設計ルール対応版）

---

## 1. この資料の目的

この資料は、Storybookを使ったことがないメンバー向けに、

* Storybookとは何か
* なぜこのプロジェクトで導入するのか
* どのコンポーネントを対象にするのか
* 実装・設計ルールとどう関係するのか

を **具体例ベース** で説明するものです。

本プロジェクトでは、Storybookを「デザインツール」や「おしゃれなカタログ」ではなく、**設計を壊さないための“開発・確認ツール”**として使います。

---

## 2. Storybookとは何か（超ざっくり）

### 一言で言うと

Storybookは、

「**画面を起動しなくても、コンポーネント単体を動かして確認できる環境**」

です。

---

### 通常の開発（Storybookなし）

* 画面を起動する
* APIやStoreが必要
* その画面に行かないとUIを確認できない
* 状態（エラー・送信中など）を再現するのが大変

---

### Storybookあり

* 画面・ルーティング不要
* コンポーネント単体で起動
* props を切り替えて状態を即確認
* APIが必要ならモック（MSW）で再現

---

## 3. なぜこのプロジェクトでStorybookを使うのか

### 理由①：CDD（コンポーネント駆動開発）と相性が良い

このプロジェクトでは、

* 画面は組み合わせ結果
* コンポーネントが主役
* props / emit を明確にする

という設計ルールを採用しています。

Storybookは、

「このコンポーネントはどんなpropsを受け取りどんな状態を持ちどう振る舞うのか」
を **コンポーネント単体で確認するための場**です。

---

### 理由②：shared/ui と Wrapper の設計を守れる

shared/ui のルールはこうでした。

* 意味のある選択肢だけを持つ
* 例外は Wrapper に閉じる

Storybookがあると、

* shared/ui の Button に variant / size / loading の状態が揃っているか
* Wrapper が「画面都合」であることが説明できるか

を **目で見て判断**できます。

---

### 理由③：レビューが楽になる

Storybookがあると、レビュー時にこう言えます。

* 「このButton、Storybookの primary / danger と同じ？」
* 「この状態、Storybookにないけど想定してる？」
* 「Wrapper作ったけど、昇格候補じゃない？」

コードだけより **意図が伝わりやすい**。

---

## 4. Storybookで“何を作るのか”（重要）

このプロジェクトでは **すべてのコンポーネントをStorybookに載せません**。

### Storybook対象（必須）

* shared/ui
  * Button
  * Input
  * Select
* sections（画面の入力ブロック）
  * AmountSection
  * MemoSection
  * WaterControlSection など

### Storybook対象（必要に応じて）

* Wrapper（RegisterButton など）
* サイドバー全体（Map画面など）

### Storybook対象外

* pages（画面）
* widgets（画面全体の骨組み）
* GoogleMap 本体（重く、依存が多い）

---

## 5. Story（ストーリー）とは何か

### Storyとは？

Storyとは、

「**このコンポーネントの1つの状態**」

を表したものです。

---

### 例：Button の場合

* 通常状態
* disabled
* loading
* danger（危険操作）

これらを **それぞれ1つのStory** として定義します。

---

### なぜ状態ごとに分ける？

理由は単純で、

* 実装者が「どんな状態を想定すべきか」分かる
* レビュー時に「想定漏れ」を見つけやすい
* 画面でしか再現できない状態を減らせる

からです。

---

## 6. shared/ui × Storybook の具体イメージ

### shared/ui/Button のStoryで確認すること

Storybook上で見るべきポイントは：

* variant が意味通りか
  * primary：主操作
  * danger：危険操作
* size が体系化されているか
* loading 時に押せないか
* disabled 時に見た目が分かるか

ここで「この画面だけpadding詰めたいな…」と思ったら、

* shared/ui ではなく Wrapper でやるべきという判断ができます。

---

## 7. Wrapper × Storybook の具体イメージ

### RegisterButton（Wrapper）のStory

RegisterButtonは、

* ラベル固定
* primary 固定
* loading 対応

という「用途固定コンポーネント」です。Storybookでは、

* 通常
* loading
* disabled

だけを用意すれば十分です。
→ 「このWrapperは何を固定しているか」が一目で分かる。

---

## 8. sections × Storybook の具体イメージ（重要）

### 例：世帯人数入力セクション

画面では複雑でも、Storybookでは以下を用意します。

* 世帯人数：1人
* 世帯人数：3人
* 未入力エラー
* 日付エラー
* disabled（送信中）

Storybookでは **APIやMapは不要**。props だけ渡して、

* 正しく描画されるか
* エラーが見えるか
* 入力イベントがemitされるか

を見るだけ。

---

## 9. GoogleMap画面とStorybookの関係

### Map自体は無理にStorybookで再現しない

理由：

* APIキーが必要
* 命令的で重い
* テストの価値が低い

---

### 代わりにやること

* サイドバー sections を Storybookで固める
* 「選択中の区画情報カード」を Storybookで確認
* MapAdapter はモックして、クリックされた前提のUIを見る

Mapとの結合は、

* E2E（Playwright）
* 実画面確認

に任せる。

---

## 10. Storybookと設計ルールの対応表

* props が多すぎる
  → 設計が崩れているサイン
* Storyが増えすぎる
  → 責務が広すぎるサイン
* 状態がStoryで説明できない
  → ロジックがUIに漏れている可能性
* Storybookに載せにくい
  → StoreやAPIに依存しすぎている可能性

Storybookは **設計の健康診断**。

---

## 11. 実務での使い方（おすすめフロー）

1. コンポーネントを作る
2. まず Storybook で単体起動する
3. 状態違いを Story として洗い出す
4. props / emit が自然か確認
5. 問題なければ画面に組み込む

「画面を見てから調整」ではなく「Storybookで固めてから組み込む」。

---

## 12. よくある誤解

* Storybookは必須作業で工数が増える
  → 実際は画面起動・確認時間が減る

* Storybookはデザイナー向け
  → このプロジェクトでは設計確認ツール

* 全部Storybookに載せないといけない
  → 重要なのは shared/ui と sections

---

## 13. まとめ（チーム向け短文）

* Storybookは「コンポーネント単体の確認場」
* CDDとセットで使う
* shared/ui と sections が主戦場
* 画面・Mapは無理に載せない
* 設計の違和感は Storybook が教えてくれる