# CLAUDE.md

UkagakaGhostMessenger（UGM）は SSP 用の PLUGIN（PLUGIN/2.0）。2.x（`release` ブランチ）では YAYA 600 系の yaya.dll をプラグイン本体にし、akari を廃止した。1.x（akari 版）は `main` ブランチに凍結されている。

## ブランチと push

- `release`: 2.x の開発・配布ブランチ。descript.txt の `homeurl` がこのブランチの raw ファイルを直接読むので、**push した内容はすぐに利用者のネットワーク更新に出る**。push は頼まれたときだけ、updates2.dau / updates.txt と中身がそろっているのを確かめてから行う。
- `main`: 1.x（akari 版）。1.0.4 の利用者が参照しているので、1.0.5（中継版）以外の変更は入れない。

## 配布の手順（2.0.0 / 2.0.1 で行ったもの）

1. `dict/functions.dic` の `version_num` と readme の「更新履歴」（公開日を含む）を更新してコミットする。
2. コミット済みの中身だけでビルドするため、スクラッチパッドに git worktree を作る（`git worktree add --detach <dir> release`）。`D:\ssp\__dev_plugin` の下に作ると、SSP がプラグインとして読み込んでしまう。開発フォルダには試験用のデータなど git 管理外のものが混じっているので、開発フォルダからはビルドしない。
3. worktree で `tools/build-nar.ps1 -UpdateOnly` を実行し、できた updates2.dau / updates.txt を開発フォルダにコピーしてコミットする。前の updates.txt と比べ、MD5 が変わったファイルが意図したものだけか確かめる（date は取り出し直しで変わる）。
4. worktree をそのコミットに進めて（`git -C <dir> checkout --detach release`）、`build-nar.ps1` で nar を作り直す（nar に新しい updates.txt / updates2.dau を入れるため）。
5. nar の中身と updates.txt の MD5 が、コミット済みの中身（worktree のファイル）とすべて一致するか確かめる。nar は 96 ファイル前後（配布物＋更新ファイル2つ）で、git 管理外のファイルや利用者のデータが入っていないこと。
6. push は頼まれたときだけ。push 後に raw.githubusercontent.com の updates2.dau / updates.txt がコミットと一致するか確かめる。
7. GitHub Releases はユーザーが作る。タグ名は版そのもの（`2.0.1` など。`1.0.5` のタグは readme と移行失敗通知の URL が前提）。添付名は必ず `UkagakaGhostMessenger.nar` にし、2.x の最新を Latest にする（Wiki Home とうめちゃんのインストールメニューが `releases/latest/download/UkagakaGhostMessenger.nar` を使う）。
8. Wiki は git リポジトリ（`https://github.com/lost-nd-xxx/UkagakaGhostMessenger.wiki.git`）を `__workspace/` に取り直してから文案を作り、反映はユーザーが行う。

## 開発用スクリプト（tools/）

konnoyayame（YAYA ゴーストのテンプレート）の開発キットを、プラグイン用に改修したもの。`<ps>` は `powershell -NoProfile -ExecutionPolicy Bypass -File` の略。

| コマンド | 内容 |
|---|---|
| `<ps> tools/setup.ps1` | tamac.exe を `tools/bin/` に取得する（GitHub からダウンロードする） |
| `<ps> tools/check-dic.ps1` | tamac.exe で辞書を読み込み、読み込みエラーを表示する |
| `<ps> tools/shiori.ps1 -Eval '式'` | SSP なしで YAYA のコードを評価する（辞書の `?? ` ハンドラが必要） |
| `<ps> tools/shiori.ps1 -Event <ID> -Reference 'a,b'` | `GET PLUGIN/2.0` を送る（`-Notify` で NOTIFY、`-Request` で生のリクエスト） |
| `<ps> tools/lint.ps1` | 未定義・未使用の変数と関数を探す（`dict/system/yaya_base/lint.dic` が必要） |
| `<ps> tools/update-yaya.ps1 -DryRun` | yaya.dll を同じ系列の最新版に更新する（システム辞書は扱わない。ダウンロードを伴うので確認を取る） |
| `<ps> tools/build-nar.ps1` | SSP で nar と updates2.dau / updates.txt を作る（`build/` に出力） |
| `<ps> tools/ssp-log.ps1` | 起動中の SSP のエラーログを読む |

- 辞書（`dict/**/*.dic`、`yaya.txt`、`system_config.txt`）を編集すると、hook が check-dic を自動で実行する。
- tamac は yaya.dll の `load` / `unload` を本当に実行する。load / unload に外部プログラムの起動やファイルの書き込みを置かないこと（SSP から最初のリクエストが来てから行う）。
- `tools/*.ps1` は ASCII だけで書き、Windows PowerShell 5.1 で動くようにする。
- 配布物からの除外は `.narignore`（.gitignore の書き方）で行い、`.updateignore` はそれを `include:` で読み込む。除外したフォルダの中のファイルは `!` で戻せないので、受信画像は `/localweb/html/res/image/*/` のようにフォルダだけを除外している。
- `build-nar.ps1 -ListOnly` は git で管理しているファイルだけを数えるので、利用者のデータ（savedata.json など）は一覧に出ない。実際の nar は SSP が作業フォルダから作るので、除外の漏れは nar の中身で確かめる。

## YAYA 600系で辞書を書くときの注意（移植で確かめたこと）

- ローカル変数はブロックの中だけで有効。`if` / `else` の中で初めて代入した変数は外で使えない（lint が「read undefined local variable」を出す）。
- 配列の中に配列を入れる構文は無い（`,` も `,=` も代入も右辺の配列を展開する）。入れ子の配列は `UGM.PushArray`（dict/functions.dic）で作る。
- ハッシュや配列を要素に持つ配列から要素を消すときは、範囲指定で `_a[i, i] = IARRAY` と書く（`_a[i] = IARRAY` は空の配列に置き換わるだけ）。
- ハッシュのキーを消す関数は無い。`UGM.HashRemove` を使う。
- 無いキーへの多次元代入は、途中の段をハッシュではなく配列として作る。途中の段は `IHASH()` で作ってから代入する。
- 関数の引数では一番外側の配列だけが展開され、ハッシュは展開されない。入れ子の配列や複数の配列を渡すときは、ハッシュに包む。ユーザー関数の戻り値の配列は、要素が1つでも配列のまま。
- カンマを含む文字列をスカラーのまま配列として読むと、カンマで区切られる。配列は `IARRAY` と `,=` で本物の配列として作る。
- 1つの式の中で、グローバル変数を書き換える関数の呼び出しと、その変数の要素の読み出し（`X['k']`）を並べない。要素の読み出しが呼び出しより先に評価されることがある（変数全体の読み出しは後になる）。関数の結果はいったん変数に受けてから使う。
- `ASORT` の `string` は大文字小文字を区別しない。akari と同じ並びにするには `string,case`。
- 正規表現で `\R` は使えない（`\r\n|\r|\n` と書く）。否定先読みは使える。
- Bash ツールでは `\\` が `\` になるので、`\` を含む辞書の編集は Edit / Write ツールで行う。

## 仕様の調べ方

- YAYA の文法と関数は https://yaya-shiori.github.io/yaya-docs/ を最新・正とする（MCP の ukagaka-doc は古いことがある）。
- PLUGIN/2.0 の仕様は UKADOC（https://ssp.shillest.net/ukadoc/manual/spec_plugin.html 、list_plugin_event.html）。
- 調べものはサブエージェント `ukagaka-researcher` に任せてよい。YAYA の関数の実際の挙動は `tools/shiori.ps1 -Eval` で確かめる。
- akari（1.x）の仕様は `__workspace/akari/akari_manual.html`（構文の説明は無い）。
