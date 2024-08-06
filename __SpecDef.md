# UkagakaGhostMessenger 仕様定義(仮)
## 目次
- [このプラグインが起こすイベント](#このプラグインが起こすイベント)
  - [OnUkagakaGhostMessenger_Ringing](#OnUkagakaGhostMessenger_Ringing)
  - [OnUkagakaGhostMessenger_Response](#OnUkagakaGhostMessenger_Response)
  - [OnUkagakaGhostMessenger_TriggerFailure](#OnUkagakaGhostMessenger_TriggerFailure)
  - [OnUkagakaGhostMessenger_RequestFailure](#OnUkagakaGhostMessenger_RequestFailure)
  - [OnUkagakaGhostMessenger_CancelFailure](#OnUkagakaGhostMessenger_CancelFailure)
  - [OnUkagakaGhostMessenger_SendComplete](#OnUkagakaGhostMessenger_SendComplete)
  - [OnUkagakaGhostMessenger_SendFailure](#OnUkagakaGhostMessenger_SendFailure)
- [このプラグインに起こせるイベント](#このプラグインに起こせるイベント)
  - [OnUkagakaGhostMessenger_Trigger](#OnUkagakaGhostMessenger_Trigger)
  - [OnUkagakaGhostMessenger_Request](#OnUkagakaGhostMessenger_Request)
  - [OnUkagakaGhostMessenger_Cancel](#OnUkagakaGhostMessenger_Cancel)
  - [OnUkagakaGhostMessenger_Send](#OnUkagakaGhostMessenger_Send)
    - [SenderId](#SenderId)
    - [SenderName](#SenderName)
    - [SenderIcon](#SenderIcon)
    - [SenderProfile](#SenderProfile)
    - [MessageId](#MessageId)
    - [Enable](#Enable)
    - [Text](#Text)
    - [EventReference](#EventReference)
    - [RunCount](#RunCount)
    - [Late](#Late)
    - [Condition](#Condition)
      - [Time_After:年4桁_月2桁_日2桁_時2桁_分2桁](#Time_After年4桁_月2桁_日2桁_時2桁_分2桁)
      - [Time_Seconds:秒数](#Time_Seconds秒数)
      - [Time_DayOfWeek:曜日の一文字](#Time_DayOfWeek曜日の一文字)
      - [Time_During:数字4桁_数字4桁](#Time_During数字4桁_数字4桁)
      - [Ghost_Booted:ゴースト名](#Ghost_Bootedゴースト名)
      - [Ghost_Closed:ゴースト名](#Ghost_Closedゴースト名)
      - [Ghost_IsBooting:ゴースト名](#Ghost_IsBootingゴースト名)
      - [Ghost_IsNotBooting:ゴースト名](#Ghost_IsNotBootingゴースト名)
      - [Ghost_Exists:ゴースト名](#Ghost_Existsゴースト名)
      - [Ghost_NotExists:ゴースト名](#Ghost_NotExistsゴースト名)
      - [Ghost_IsInAddressBook:ゴースト名](#Ghost_IsInAddressBookゴースト名)
      - [Ghost_Triggered:イベント識別子:トリガーを立ててきたゴースト名](#Ghost_Triggeredイベント識別子トリガーを立ててきたゴースト名)
      - [Message_Run:ゴースト名:送信者識別子:メッセージ識別子](#Message_Runゴースト名送信者識別子メッセージ識別子)
      - [Message_IsRun:ゴースト名:送信者識別子:メッセージ識別子](#Message_IsRunゴースト名送信者識別子メッセージ識別子)
      - [Message_IsNotRun:ゴースト名:送信者識別子:メッセージ識別子](#Message_IsNotRunゴースト名送信者識別子メッセージ識別子)
      - [Message_Read:ゴースト名:送信者識別子:メッセージ識別子](#Message_Readゴースト名送信者識別子メッセージ識別子)
      - [Message_IsRead:ゴースト名:送信者識別子:メッセージ識別子](#Message_IsReadゴースト名送信者識別子メッセージ識別子)
      - [Message_IsNotRead:ゴースト名:送信者識別子:メッセージ識別子](#Message_IsNotReadゴースト名送信者識別子メッセージ識別子)
- [プラグイン独自の記法](#プラグイン独自の記法)
  - [メッセージ任意改行](#メッセージ任意改行)
  - [条件達成時の時間類](#条件達成時の時間類)
  - [画像貼り付け](#画像貼り付け)
  - [スタンプ貼り付け](#スタンプ貼り付け)
- [プラグイン独自の仕様](#プラグイン独自の仕様)
  - [差し替え対象のシステム予約字](#差し替え対象のシステム予約字)
  - [画像コピーの仕様](#画像コピーの仕様)

## このプラグインが起こすイベント
* 反応したい場合はゴースト側にこのイベントを書く
* [ゴースト名のシステム予約字は半角アンダーバーに差し替えられた状態で来る](#差し替え対象のシステム予約字)
  * 例: Emily/Phase4.5 -> Emily_Phase4.5

### OnUkagakaGhostMessenger_Ringing
\[対象ゴースト]全員\
\[イベント種別]GET(即時トーク可能)\
\[いつ]プラグインに設定されたメッセージの発火時\
Reference0: 送信元ゴースト名\
Reference1: 送信者識別子\
Reference2: メッセージ識別子\
Reference3～: 追加情報(メッセージに情報があれば)\
[「EventReference」も参照のこと](#EventReference)

### OnUkagakaGhostMessenger_Response
\[対象ゴースト]このプラグインに[OnUkagakaGhostMessenger_Request](#OnUkagakaGhostMessenger_Request)を送付したゴースト\
\[イベント種別]GET(即時トーク可能)\
\[いつ]OnUkagakaGhostMessenger_Requestの送信後すぐ\
Reference0: ゴースト名\
Reference1: 送信者識別子\
Reference2: メッセージ識別子\
Reference3: このメッセージ識別子の発生済み回数（予約でリセットされる）\
Reference4: メッセージ発生時のPC時刻（yyyy/mm/dd HH:MM:SS形式、2024年7月1日13時1分0秒なら2024/07/01 13:01:00）　0なら未発生\
Reference5: そのメッセージが既読になった時刻（形式は同上）　0なら未読（未発生含む）\
Reference6: 文面のランダム選択の結果（1つめ）（あれば）\
Reference7～: ランダム選択結果続き（あれば） \

### OnUkagakaGhostMessenger_SendComplete
\[対象ゴースト]このプラグインにイベントを送付したゴースト\
\[イベント種別]GET(即時トーク可能)\
\[いつ]イベントの処理に成功したとき\
Reference0: 成功種別（普通の送信の時：`send`、送信単体取り消しの時：`cancel`）\
Reference1: 処理できたメッセージ識別子\
Reference2: 指定されていた送信者識別子

### OnUkagakaGhostMessenger_SendFailure
\[対象ゴースト]このプラグインにイベントを送付したゴースト\
\[イベント種別]GET(即時トーク可能)\
\[いつ]イベントの処理に失敗したとき\
Reference0: 失敗理由\
Reference1: 処理できなかったメッセージ識別子（わからない場合空欄）\
Reference2: 指定されていた送信者識別子（わからない場合空欄）

## このプラグインに起こせるイベント
* ゴーストから`\![raiseplugin,UkagakaGhostMessenger,イベント名,Reference0,Reference1,～～]`などとする
* [ゴースト名に含まれるシステム予約字は半角アンダーバーに差し替えた状態で送る](#差し替え対象のシステム予約字)
  * 例: Emily/Phase4.5 -> Emily_Phase4.5

### OnUkagakaGhostMessenger_Trigger
Reference0: \[省略不可]イベント識別子\
Reference1: \[省略可]対象ゴースト名\
\[省略時の動作]全員\
Reference2: \[省略可]対象の送信者識別子\
\[省略時の動作]Reference1で指定されたゴースト内の全員　省略したら全ての全員\
メッセージに影響するトリガーをゴーストから起こす

### OnUkagakaGhostMessenger_Request
Reference0: \[省略可]ゴースト名\
Reference1: \[省略可]送信者識別子\
Reference2: \[省略不可]メッセージ識別子\
\[省略時の動作]動作なし\
指定したメッセージの状況をプラグインへ問い合わせる\
Reference0やReference1を省略した場合、どちらも現在のゴースト名が用いられる
情報問い合わせの結果は[OnUkagakaGhostMessenger_Response](#OnUkagakaGhostMessenger_Response)で返却される

### OnUkagakaGhostMessenger_Cancel
Reference0: \[省略可]送信者識別子\
\[省略時の動作]そのゴーストに属する送信者識別子全て\
指定した送信者識別子の送信予約を全て取り消す

### OnUkagakaGhostMessenger_Send
メッセージ送信や送信取り消しなどの設定\
Referenceは順不同\
`\![raiseplugin,UkagakaGhostMessenger,OnUkagakaGhostMessenger_Send,--SenderId=送信者識別子]`などのように指定\
書式は後述

#### SenderId
\[省略可]送信者識別子\
\[省略時の動作]ゴースト名\
ゴーストごとに複数持つことも可能

#### SenderName
\[省略可]送信者名(表示用)\
\[省略時の動作]ゴースト名\
同じ[SenderId](#SenderId)に対して異なるSenderNameが設定された場合、\
メッセージの発火時に上書きされる

#### SenderIcon
\[省略可]送信者プロフィールアイコン(アドレス帳など)\
\[省略時の動作]更新しない\
デフォルトアイコンに戻したい時はデフォルトアイコンで上書きする（`--SenderIcon=default`）\
画像パスは`ghost\master\`からの相対パス `ghost\master\image\icon.png`の場合`image\gazou.png`\
正方形以外の大きさの場合、中央のあたりを切り取って表示\
5MB以上のファイルサイズは受け付けない\
[画像コピーの仕様上、演出で画像変更をする場合は違うファイル名で行うことを推奨](#画像コピーの仕様)

#### SenderProfile
\[省略可]送信者プロフィール文章(アドレス帳など)\
\[省略時の動作]更新しない\
見かけ上で削除したい場合は空白1個などで上書きする\
[（UGM独自記法が反映される）](#プラグイン独自の記法)

#### MessageId
\[省略可]メッセージ識別子\
\[省略時の動作]プロフィールのみの更新\
同じ識別子で設定を送信すると更新される

#### Enable
\[省略可]そのメッセージを有効にするかどうか\
\[省略時の動作]1(有効)\
1で有効、0で無効\
設定済みのメッセージを停止したい時用

#### Text
\[省略可]メッセージ本文\
\[省略時の動作]送信者プロフィールのみの登録および更新\
[（UGM独自記法が反映される）](#プラグイン独自の記法)

#### EventReference
\[省略可]発生時に起動中のゴーストへ送信する情報\
\[省略時の動作]動作なし\
[OnUkagakaGhostMessenger_Ringing](#OnUkagakaGhostMessenger_Ringing)のReference3～に追加の情報を入れることができる(複数可)\
複数の情報を入れる場合は`--EventReference=r3,--EventReference=r4`などのように指定\
通し番号は先に書いた順から自動で振られる

#### RunCount
\[省略可]メッセージ実行回数\
\[省略時の動作]1\
0で無限に繰り返し　1で1回　2～で2回～
同じメッセージIDに対して再度Sendを送ると実行済み回数は0に戻る

#### Late
\[省略可能]メッセージ発生条件を満たしてから表示までの遅延する時間を秒数で\
\[省略時の動作]0（遅延なし）\
半角ハイフン-で2つの数値を区切るとその数値間でランダムな整数になる\
[RunCount](#RunCount)を複数回にするときは指定推奨

#### Condition
\[省略可能]メッセージが実際に表示される条件（複数指定OK）\
[Late](#Late)の指定がない場合、条件達成後に即時メッセージ表示される\
以下、`--Condition=Time_Seconds:1800,--Condition=Ghost_IsBooting:Emily_Phase4`などの形で指定

##### Time_After:年4桁:月2桁:日2桁:時2桁:分2桁
指定時刻以降\
年〜時は左から順に省略可\
省略した場合、毎年の6月、など繰り返し使われる\
2024年6月の20時、などのように途中を省略することはできない

##### Time_Seconds:秒数
「今から??秒後」のような形で指定する

##### Time_DayOfWeek:数字
現在が特定の曜日であるとき、この条件を達成とする\
1～7の数字で指定\
1 = 日\
2 = 月\
3 = 火\
4 = 水\
5 = 木\
6 = 金\
7 = 土

##### Time_During:数字4桁_数字4桁
0時0分〜23時59分を数字4桁_数字4桁で指定する\
`2200_0300`などの0時またぎも設定可能\
複数設定時は`0600_0800:1200_1300:1800_1900`などのように:で区切る

##### Ghost_Booted:ゴースト名
特定ゴーストが起動された瞬間

##### Ghost_Closed:ゴースト名
特定ゴーストが終了された瞬間

##### Ghost_IsBooting:ゴースト名
特定ゴーストが起動している時\
複数体指定する時は`Ghost_IsBooting:ゴースト名１:ゴースト名２`のようにする

##### Ghost_IsNotBooting:ゴースト名
特定ゴーストが起動していない時\
複数体指定する時は`Ghost_IsNotBooting:ゴースト名１:ゴースト名２`のようにする

##### Ghost_Exists:ゴースト名
特定ゴーストがインストールされている\
複数体指定する時は`Ghost_Exists:ゴースト名１:ゴースト名２`のようにする

##### Ghost_NotExists:ゴースト名
特定ゴーストがインストールされていない\
複数体指定する時は`Ghost_NotExists:ゴースト名１:ゴースト名２`のようにする

##### Ghost_IsInAddressBook:ゴースト名
特定ゴーストがアドレス帳に登録されている\
複数体指定する時は`Ghost_InAddressBook:ゴースト名１/送信者識別子１:ゴースト名２/送信者識別子２`のようにする

##### Ghost_Triggered:イベント識別子:トリガーを立ててきたゴースト名
[OnUkagakaGhostMessenger_Trigger](#OnUkagakaGhostMessenger_Trigger)で、\
起動中ゴーストが特定のイベント識別子を指定した時\
ゴースト名は省略可能\
その場合`Ghost_Triggered:イベント識別子`となる

##### Message_Run:ゴースト名:送信者識別子:メッセージ識別子
指定した識別子のメッセージが発生した瞬間\
（既読の状況は問わず）\
他ゴーストのメッセージ識別子も指定可

##### Message_IsRun:ゴースト名:送信者識別子:メッセージ識別子
指定した識別子のメッセージが発生済み\
（既読の状況は問わず）\
他ゴーストのメッセージ識別子も指定可\
複数件指定する時は以下のようにする\
`--Condition=Message_IsRun:ゴースト名１/送信者識別子１/メッセージ識別子１:ゴースト名２/送信者識別子２/メッセージ識別子２`

##### Message_IsNotRun:ゴースト名:送信者識別子:メッセージ識別子
指定した識別子のメッセージが未発生\
（予約の状況は問わず）\
他ゴーストのメッセージ識別子も指定可\
複数件指定する時は以下のようにする\
`--Condition=Message_IsNotRun:ゴースト名１/送信者識別子１/メッセージ識別子１:ゴースト名２/送信者識別子２/メッセージ識別子２`

##### Message_Read:ゴースト名:送信者識別子:メッセージ識別子
指定した識別子のメッセージが既読になった瞬間\
他ゴーストのメッセージ識別子も指定可

##### Message_IsRead:ゴースト名:送信者識別子:メッセージ識別子
指定した識別子のメッセージが既読である\
他ゴーストのメッセージ識別子も指定可\
複数件指定する時は以下のようにする\
`--Condition=Message_IsRead:ゴースト名１/送信者識別子１/メッセージ識別子１:ゴースト名２/送信者識別子２/メッセージ識別子２`

##### Message_IsNotRead:ゴースト名:送信者識別子:メッセージ識別子
指定した識別子のメッセージが未読\
（予約および発生の状況は問わず）\
他ゴーストのメッセージ識別子も指定可\
複数件指定する時は以下のようにする\
`--Condition=Message_IsNotRead:ゴースト名１/送信者識別子１/メッセージ識別子１:ゴースト名２/送信者識別子２/メッセージ識別子２`

## プラグイン独自の記法
タグの中にタグを含めることはできない\
※独自記法の無効化の仕様は廃止しました※\

### メッセージ任意改行
\[反映される枠]メッセージ本文/送信者プロフィール文\
`:nl:`

### 文字列ランダム選択
\[反映される枠]メッセージ本文/送信者プロフィール文\
`:choice_start:単語１:単語２～～:choice_end:`\
例：`:choice_start:いぬはワンワン:さるはウキキ:きじはケンケン:choice_end:`\
メッセージ本文に用いた場合のランダム選択結果は、OnUkagakaGhostMessenger_Requestで取得できる

### 条件達成時の時間類
\[反映される枠]メッセージ本文/送信者プロフィール文\
時刻類は発生条件を達成したときの情報が記録される
| タグ                   | 内容                                 |
| ---------------------- | ------------------------------------ |
| `:year:`               | 条件達成時の年                       |
| `:month:`              | 条件達成時の月                       |
| `:day:`                | 条件達成時の日                       |
| `:weekday:`            | 条件達成時の曜日                     |
| `:hour:`               | 条件達成時の時（24時間制）           |
| `:ampm:`               | 条件達成時の午前・午後               |
| `:hour12:`             | 条件達成時の時（12時間制）           |
| `:minute:`             | 条件達成時の分                       |
| `:second:`             | 条件達成時の秒                       |
| `:systemuptime:`       | OS連続起動時間（単位：秒）           |
| `:systemupsecond:`     | OS連続起動時間を時分秒とした場合の秒 |
| `:systemupminute:`     | OS連続起動時間を時分秒とした場合の分 |
| `:systemuphour:`       | OS連続起動時間を時分秒とした場合の時 |
| `:memoryload:`         | 物理メモリの使用率                   |
| `:memorytotalphys:`    | 物理メモリ量                         |
| `:memoryavailphys:`    | 空き物理メモリ量                     |
| `:memorytotalvirtual:` | 仮想＋物理メモリ量                   |
| `:memoryavailvirtual:` | 仮想＋物理空きメモリ量               |

### 画像貼り付け
\[反映される枠]メッセージ本文\
`:image:画像の相対パス:` または `:image:画像の相対パス:alt=代替テキスト:`\
画像パスは`ghost\master\`からの相対パス `ghost\master\image\icon.png`の場合`image\gazou.png`\
5MB以上のファイルサイズは受け付けない\
正方形以外の大きさの場合、中央のあたりを切り取って表示\
[画像コピーの仕様上、演出で画像変更をする場合は違うファイル名で行うことを推奨](#画像コピーの仕様)

### スタンプとしての画像貼り付け
\[反映される枠]メッセージ本文\
`:image:nozoom=画像の相対パス:` または `:image:nozoom=画像の相対パス:alt=代替テキスト:`\
スタンプと同じ表示になる　クリックしても拡大されない
正方形以外の大きさの場合、中央のあたりを切り取って表示\

### スタンプ貼り付け
\[反映される枠]メッセージ本文\
`:stampスタンプ番号:`\
「img/default」内のstamp??.pngの画像をメッセージ内に貼り付けられる\
番号はファイル名の番号をそのまま　stamp001.pngなら`:stamp001:`

## プラグイン独自の仕様

### 差し替え対象のシステム予約字
* 以下の文字がゴースト名に含まれている場合、半角アンダーバーに差し替えられる
* `` !%'"#$&()*+,\-/:;<=>?@[]`{|}~``
  * 例: Emily/Phase4.5 -> Emily_Phase4.5

### 画像コピーの仕様
* 同じゴーストが同じファイル名で画像を送ってきた場合は、プラグイン側に保存されている画像が即時更新される
  * メッセージ発生のタイミングとは関係ない
