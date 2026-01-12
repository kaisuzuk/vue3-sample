────────────────────────────────────────
【テンプレ1】画面構成マップ（コンポーネント分解図）
────────────────────────────────────────

タイトル：＜画面名＞ 画面構成マップ
対象画面：＜画面ID/画面名＞
作成日：＜YYYY-MM-DD＞
作成者：＜氏名＞
関連資料：既存設計書フォルダ（1_機能概要 / 2_画面表示 / 3_画面イベント / 4_初期表示）

1. 目的（この資料で分かること）

* この画面を構成するコンポーネントの粒度と境界（Page / Widget / Section / shared/ui）を明確にする
* Storybook対象（shared/ui / section）の見当を付ける

2. 画面の構造（上から順に）

* Page：＜Pageコンポーネント名＞
  * 責務：ルーティング入口／画面遷移／（必要なら）権限チェック

* Widget：＜Widgetコンポーネント名＞
  * 責務：レイアウト骨組み／usecase呼び出し／Sectionへprops配布／emitをactionsへ接続

* Sections（中粒度・表示/入力のみ）
  * ＜Section名1＞：＜役割（例：基本情報入力）＞
  * ＜Section名2＞：＜役割（例：数量入力）＞
  * ＜Section名3＞：＜役割（例：写真カルーセル）＞
  * …

* Wrapper（必要な場合のみ）
  * ＜Wrapper名＞：＜用途固定 or 画面固有例外の理由＞

* shared/ui（共通UI部品）
  * Button / TextInput / NumberInput / Select / DatePicker / …（使用予定を列挙）

3. コンポーネント間のデータ流れ（1行で）

* usecase（状態） → Widget（配布） → Sections（表示/入力） → emit → Widget → actions（状態更新）

4. Storybook対象（暫定）

* 必須：shared/ui（＜対象列挙＞）、Sections（＜対象列挙＞）
* 任意：Wrapper（＜対象列挙＞）
* 対象外：Page / Widget（原則）

5. 補足（粒度で迷った点）

* ＜迷った点／なぜこの粒度にしたか＞

---

────────────────────────────────────────
【テンプレ2】状態・責務割当設計書（最重要）
────────────────────────────────────────

タイトル：＜画面名＞ 状態・責務割当設計
対象画面：＜画面ID/画面名＞
作成日：＜YYYY-MM-DD＞
作成者：＜氏名＞
対応usecase：＜useXXX名（例：useWorkLogEdit）＞
関連Store：＜useYYYStore名（あれば）＞

1. 目的

* 「どの状態／処理をどこに置くか」を先に決め、実装ブレとStore肥大化を防ぐ

2. 境界ルール（この画面の方針）

* Page：ルーティング／画面遷移のみ（業務ロジック禁止）
* Widget：レイアウト＋配線（props配布／emit→actions）
* Section：表示・入力のみ（API/Store/業務判断禁止）
* usecase：画面状態の唯一の真実（form/ui/view/errors/actions）
* Store：共有・キャッシュ（画面固有draftは禁止）
* entities：純関数（バリデーション・整合）

3. 状態・処理の割当表（ここが本体）

* 項目ごとに「置き場所」と「理由」を必ず書く

A. 入力値（form）

* ＜項目名＞：＜usecase.formのフィールド名＞
  * 置き場所：usecase.form
  * 理由：＜画面固有入力値であり唯一の真実にするため＞

B. UI状態（ui）

* submitting：usecase.ui.submitting
* touched/dirty：usecase.ui.touched / dirty
* sidebarOpen（地図画面など）：usecase.ui.sidebarOpen
  * 理由：＜画面固有で破棄すべき／表示制御＞

C. 表示用導出値（view）

* 例：canSubmit、表示する入力行配列、選択中表示用データ
  * 置き場所：usecase.view（computed）
  * 理由：＜UI判断を分散させず一本化＞

D. バリデーション（errors）

* 置き場所：entities.validateXXX（純関数）＋ usecase.errors（UI向け整形）
* 理由：＜ドメイン判断の分離／テスト容易性＞

E. API呼び出し

* load（初期取得）：usecase.actions.load → features/api
* submit（登録更新）：usecase.actions.submit → features/api
* 理由：＜UIから分離／MSWで差し替え可能にする＞

F. 画面遷移・通知

* 成功時遷移：Page
* トースト表示：Widget（UI演出）or shared（方針に従う）
* 理由：＜責務境界＞

4. イベント→状態遷移（簡易）

* 例：ポリゴンクリック → selectId更新 → sidebarOpen true
* 例：登録ボタン押下 → submitting true → API → 成功/失敗

5. 禁止事項（この画面のガード）

* SectionでAPI呼び出し禁止
* 画面固有draftをStoreに入れない
* UIが業務ルールを判断しない（view/actionsに寄せる）

---

────────────────────────────────────────
【テンプレ3】コンポーネント設計書（Section単位）
────────────────────────────────────────

タイトル：＜画面名＞ Section設計：＜Section名＞
対象Section：＜Sectionコンポーネント名＞
作成日：＜YYYY-MM-DD＞
作成者：＜氏名＞
関連usecase：＜useXXX名＞
Storybook：必須 / 任意（どちらか）

1. 目的

* Sectionを「表示・入力のみ」に保ち、props/emit契約を明文化する

2. 役割（このSectionが担当すること）

* ＜例：世帯人数と世帯員（氏名・生年月日）の入力UIを提供する＞

3. 扱う状態（持ってよい／持ってはいけない）

* 持ってよい：純UI状態（例：カルーセル位置、開閉状態）
* 持ってはいけない：API、Store、バリデーションロジック、他Sectionへの影響判断

4. Props（入力）

* ＜prop名＞：型、必須/任意、意味
  * 例：members：MemberViewModel[]（人数分そろった表示用配列）
  * 例：errors：MemberErrors[]（表示用）
  * 例：disabled：boolean

5. Emits（出力）

* ＜event名＞：payload、発火条件
  * 例：updateMember(index, patch)
  * 例：changeHouseholdSize(size)
  * 例：submit / cancel（Sectionがボタンを持つ場合のみ）

6. 画面状態パターン（Storybookの観点）

* 通常
* 未入力
* エラーあり（入力形式エラー等）
* disabled（送信中）
* データ多め（リスト長い等）

7. UI仕様メモ

* 入力制約（UI上のものだけ：桁数、キーボード種別など）
* 表示条件（ifを使うなら、その条件はviewから渡されたフラグのみを見る）

---

────────────────────────────────────────
【テンプレ4】Store / usecase 関係整理書（推奨）
────────────────────────────────────────

タイトル：＜画面名＞ Store / usecase 関係整理
対象画面：＜画面ID/画面名＞
作成日：＜YYYY-MM-DD＞
作成者：＜氏名＞

1. 目的

* Store濫用（肥大化・状態残留）を防ぎ、「なぜStoreか」を説明できるようにする

2. この画面で使うusecase

* usecase名：＜useXXX名＞

  * 役割：画面固有状態（選択・編集中draft・mode・errors・actions）
  * 破棄タイミング：画面離脱で破棄（基本）

3. この画面で使うStore一覧（Pinia）

* Store名：＜useYYYStore＞

  * 何を持つ：＜共有データ／マスタ／キャッシュ＞
  * 誰が使う：＜複数画面名＞
  * 取得更新：＜loadのタイミング／キャッシュ戦略＞
  * 画面固有状態を持たない根拠：＜draft等はusecaseへ＞

4. 「Storeに置かない」項目の明示

* 例：selectedId（画面固有）
* 例：sidebarOpen（画面固有）
* 例：draft（画面固有）
* 理由：画面遷移で確実に破棄／他画面と共有しない

5. データ取得責務（Query/Commandの整理）

* Query（参照）：Store
* Command（更新登録）：usecase.actions → api
* 例外：＜必要なら＞

---

────────────────────────────────────────
【テンプレ5】Storybook対象設計書（推奨）
────────────────────────────────────────

タイトル：＜画面名＞ Storybook対象設計
対象画面：＜画面ID/画面名＞
作成日：＜YYYY-MM-DD＞
作成者：＜氏名＞

1. 目的

* Storybook導入範囲を明確にし、「どこまでやるか」で迷わないようにする

2. 対象方針（このプロジェクトの基本）

* 必須：shared/ui、sections
* 任意：wrapper
* 原則対象外：page、widget、外部I/Oが重いもの（GoogleMap本体など）

3. 対象コンポーネント一覧

A. shared/ui（必須）

* Button
* TextInput
* NumberInput
* Select
* DateInput
* ほか：＜追加＞

B. sections（必須）

* ＜Section名1＞
* ＜Section名2＞
* …

C. wrapper（任意）

* RegisterButton（用途固定）
* MapActionButton（画面固有例外）
* …

4. 各コンポーネントの必須Story（状態パターン）

共通で最低限そろえるセット（例）

* 通常
* disabled
* loading（あれば）
* エラー表示（入力系）
* データ多め／最大ケース（必要なら）

5. APIが必要なStoryの扱い（MSW）

* MSWを使う対象：＜例：サイドバー全体を単体で動かす場合＞
* MSWを使わない対象：shared/ui、sections（基本propsだけで完結させる）

6. 対象外にした理由（明記）

* Page/Widget：画面統合はE2Eや実画面で担保するため
* GoogleMap：依存が重くStorybookの費用対効果が低いため

---

必要なら次に、上のテンプレを「あなたの地図＋サイドバー画面」に当てはめた **サンプル完成版（実データ入り）**を作って、チームに「こう書く」という見本にできます。
