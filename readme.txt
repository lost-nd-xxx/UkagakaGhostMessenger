# UkagakaGhostMessenger
伺かベースウェア向けプラグインです。
メッセージアプリ風の画面で、対応ゴーストからメッセージを受け取ることができます。

制作者: ろすえん(lost_nd_xxx)
連絡先: http://lnx.flop.jp/

------------------------
## 取扱説明書等
* ゴースト使用者向け説明書 https://github.com/lost-nd-xxx/UkagakaGhostMessenger/wiki/HowToUse#ゴースト使用者向け
* ゴースト制作者向け説明書 https://github.com/lost-nd-xxx/UkagakaGhostMessenger/wiki/HowToUse#ゴースト制作者向け
* 仕様書 https://github.com/lost-nd-xxx/UkagakaGhostMessenger/wiki/Specification

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
## 開発中のAI利用について
このプラグインは、AIコーディングエージェント（Claude）を用いて開発しました。

------------------------
## ライセンス
このプラグイン（UkagakaGhostMessenger）はMITライセンスです。全文はプラグインフォルダ/LICENSE を参照してください。
改変したものの公開・再配布（フォークやプルリクエストを含む）も、MITライセンスの範囲で自由に行えます。

ただし、以下はMITライセンスの対象外です。
* 同梱しているモジュール等：それぞれのライセンスに従います（下の「使用モジュール等のライセンス」を参照）。
* うめちゃんのイラスト（localweb/html/res/image/icon_default.png、localweb/html/res/image/page_background.png）：ユスラさんの作品です。
  * このプラグイン（改変したものを含む）に、イラストのファイルを改変せずに同梱して再配布することはできます。
  * イラストのファイルそのものの改変や、このプラグインから切り離しての利用（他の作品の素材にするなど）はできません。
  * イラストを外したり、別の画像に差し替えたりするのは自由です。

------------------------
## 使用モジュール等のライセンス
* YAYA  https://github.com/YAYA-shiori/yaya-shiori
  * ライセンスは以下のどちらかを参照のこと
    * プラグインフォルダ/license_text/yaya.txt
    * https://github.com/YAYA-shiori/yaya-shiori/blob/600/readme.txt
  * AYA Ver.5 の元のライセンス: プラグインフォルダ/license_text/aya-original.txt

* うかてん https://github.com/nikolat/ukaten
  * 1.x系のmain.azrの処理を元に、2.x系の辞書（dict/system/yaya_plugin2.dic）を作成しています。
> 上記以外のテキストファイル、辞書ファイルの類いは、
> すべてpublic domainとして自由に利用できるものとします。

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

* yaya-dic https://github.com/YAYA-shiori/yaya-dic
  * Public Domain (Unlicense) https://github.com/YAYA-shiori/yaya-dic/blob/master/LICENSE

* 紺野ややめ https://github.com/YAYA-shiori/konnoyayame
  * 同梱の開発キット（開発用スクリプト）を当方で改変し、開発に使用しています（配布物には含みません）。
  * Public Domain (Unlicense) https://github.com/YAYA-shiori/konnoyayame/blob/master/LICENSE

* 第弐版仮想道頓堀水泳拡張（道頓堀プラグイン） https://ms.shillest.net/yaya_as.xhtml
  * NYSDL Version 0.9982 プラグインフォルダ/license_text/TOMBORI.txt

### うめちゃんのイラスト
ユスラさんがにじジャーニーで生成されたものを加工して使っています。
* にじジャーニー https://nijijourney.com/ja/
  * にじジャーニー利用規約 https://docs.midjourney.com/docs/terms-of-service
