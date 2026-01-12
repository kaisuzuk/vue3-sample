# Storybook 導入ガイド（BP向け）

## 1. 目的と位置づけ

本プロジェクトでは、Vueマイグレーションにあたり**UI部品を業務ロジック・APIコールから分離** する方針を採用します。
Storybook はそのための以下の役割を担います。

* 画面に依存しない **共通UI部品（shared/ui）** の確認・開発
* UIの状態（通常／無効／エラー／ローディング等）を一覧で可視化
* 実装者以外（設計者・レビュー担当）がUIを確認できる環境の提供

👉 **業務仕様やAPI設計が未確定でも進められる作業** です。

---

## 2. 今回の作業スコープ（重要）

### やること

* Storybook の導入
* shared/ui 配下の **純UIコンポーネント** のStory作成

### やらないこと（禁止）

* API呼び出しを行うコンポーネント
* Pinia / Store を import するコンポーネント
* 業務ロジック・業務判断を含むUI
* 特定画面専用のコンポーネント

👉 **props と emit だけで完結するUI** に限定してください。

---

## 3. 前提条件

* Node.js / npm（または yarn / pnpm）が使用可能
* 既存のフロントエンドプロジェクトに導入する
* Vue（2 or 3）はプロジェクトの現行構成に合わせる

※ Vue2 / Vue3 のどちらでも構いません。
※ 判断に迷った場合は作業前に相談してください。

---

## 4. Storybook 導入手順

### 4.1 Storybook の初期化

プロジェクトルートで以下を実行します。

```
npx storybook@latest init
```

対話形式の質問には、以下の方針で回答してください。

* Framework: Vue（Vue2 / Vue3は自動判定でOK）
* TypeScript: プロジェクトに合わせる
* Addons: 基本セットを有効化（Yes）

導入後、以下が生成されていればOKです。

* .storybook/ ディレクトリ
* stories サンプル
* package.json に storybook scripts

---

### 4.2 起動確認

```
npm run storybook
```

ブラウザで Storybook が起動し、サンプルStoryが表示されることを確認してください。

---

## 5. ディレクトリ構成ルール

### 基本構成

```
src/
  shared/
    ui/
      Button/
        Button.vue
        Button.stories.ts
      TextField/
        TextField.vue
        TextField.stories.ts
```

### ルール

* **1コンポーネント = 1ディレクトリ**
* Storyファイルはコンポーネントと同じ階層
* UI部品は必ず `shared/ui` 配下に置く

---

## 6. コンポーネント設計ルール（重要）

### props

* 表示状態を表す props は積極的に持たせる

  * disabled
  * loading
  * error
  * readonly など
* 業務的な意味を持つ名前は禁止

  * ❌ `isAdmin`
  * ❌ `isHouseholdHead`

### emit

* ユーザー操作結果のみ emit する

  * click
  * change
  * input
* API成功／失敗などは emit しない

---

## 7. Story の書き方ルール

### 必須Story

最低限、以下の状態を用意してください。

* Default（通常）
* Disabled（操作不可）
* Error（エラー表示がある場合）
* Loading（ローディングがある場合）

### Storyの役割

* 「このUIはどんな状態を取りうるか」を一覧で示す
* テストではなく **UIカタログ** という意識で作る

---

## 8. Interaction（任意・余裕があれば）

余裕があれば、以下のような確認を入れてもOKです。

* ボタンをクリックすると emit が発火する
* 入力すると change / input が発火する

※ 内部実装（メソッド呼び出し等）は検証しないでください。

---

## 9. レビュー観点（BP自身のセルフチェック用）

PR前に以下を確認してください。

* API / Store / 業務ロジックを import していない
* props と emit だけで完結している
* Storyが「状態一覧」になっている
* 画面専用っぽい命名になっていない
* デザイン・レイアウトが極端に画面寄りでない

---

## 10. よくあるNG例

❌ コンポーネント内で axios を呼ぶ
❌ `useStore()` を import
❌ 「◯◯画面用ボタン」など画面名を含む命名
❌ props に業務判断が混ざる
❌ Story が1つしかない

---

## 11. 完了条件

以下を満たせば作業完了です。

* Storybook が起動できる
* shared/ui 配下のコンポーネントが表示できる
* 各コンポーネントに複数の状態Storyがある
* README もしくはコメントで簡単な使い方が分かる

---

## 12. 困ったら

* 判断に迷うUIは **作らずに相談**
* 「これは共通UIか？」と感じたら必ず確認
