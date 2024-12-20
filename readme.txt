# UkagakaGhostMessenger
伺かベースウェア向けプラグインです。
メッセージアプリ風の画面で、対応ゴーストからメッセージを受け取ることができます。

制作者: ろすえん(lost_nd_xxx)
連絡先: http://lnx.flop.jp/

------------------------
## 取扱説明書等
※【要差し替え】
* ゴースト使用者向け説明書 URL
* ゴースト制作者向け説明書 URL
* 仕様書 URL

------------------------
## メッセージ履歴について
このプラグインの使用に際してプラグインフォルダ内に蓄積される文章や画像などは、各ゴーストから送信されたものです。
各データの取り扱いは、送信元ゴーストの規約に従ってください。

------------------------
## ファイアウォールの表示が出た場合
UGM導入後、ファイアウォールから「ugm_server.exe」の動作を許可するかどうか聞かれる場合があります。
ugm_server.exeはSSPと情報をやりとりできるようにするためのアプリです。
深刻な不具合などの無いように気を付けますが、何か不利益があっても補償はできない、ということをご理解の上で許可してください。
許可しなかった場合、メッセージ受信履歴を閲覧できなくなります。
ugm_server.exeを有効にしていない状態でも、プラグイン自体が有効であれば、メッセージ受信のみ動作します。

また、UGM起動直後の数秒間だけ、マウスカーソルが砂時計状態になります。
ugm_server.exeの起動によるもので、仕様です。

------------------------
## ローカルホストのポート番号の変更について
「ugm_config.txt」の数値を書き換えることで、UGMの使用するポート番号を変更できます。
※プラグインを再起動するまで設定は反映されません。
プラグインエクスプローラから、UGMを右クリックし、無効にした後有効に戻してください。

以下の場合などにご活用ください。
* UGM以外のツールを使おうとしてUGMのページが開かれてしまった
* UGMのページを開こうとして関係ないツールのページが開かれてしまった

------------------------
## 使用モジュール等のライセンス
* akari http://le.silk.to/akari.php
> このプログラムを使用したいかなる不利益も作者は責任を負いません。
> 伺かのサブシステムとして使う場合に限り、無償で無制限に使用できます。

* うかてん https://github.com/nikolat/ukaten
  * main.azrを当方による改変ののちに組み込んでいます。
> 上記以外のテキストファイル、辞書ファイルの類いは、
> すべてpublic domainとして自由に利用できるものとします。

* YAYA as SAORI https://github.com/YAYA-shiori/yaya-as-saori
  * Unlicense license https://github.com/YAYA-shiori/yaya-as-saori/blob/main/LICENSE

* manpu_doodle https://github.com/lost-nd-xxx/manpu_doodle
  * Unlicense license https://github.com/lost-nd-xxx/manpu_doodle/blob/main/LICENSE

* fuwaimg https://do.gt-gt.org/product/fuwaimg/
  * MITライセンス https://licenses.opensource.jp/MIT/MIT.html

* Material Symbols & Icons https://fonts.google.com/icons
  * Apache License Version 2.0 https://www.apache.org/licenses/LICENSE-2.0.html

* jsstp https://github.com/ukatech/jsstp-lib
  * WTFPL https://github.com/ukatech/jsstp-lib/blob/master/LICENSE

* go https://go.dev/
  * 三条項BSDライセンス https://go.dev/LICENSE

### うめちゃんのイラスト
ユスラさんがにじジャーニーで生成されたものを加工して使っています。
* にじジャーニー https://nijijourney.com/ja/
  * にじジャーニー利用規約 https://docs.midjourney.com/docs/terms-of-service
