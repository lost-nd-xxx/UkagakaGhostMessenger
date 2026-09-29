# CLAUDE.md

UkagakaGhostMessenger（UGM）は SSP 用の PLUGIN（PLUGIN/2.0）。2.x（`release` ブランチ）では YAYA 600 系の yaya.dll をプラグイン本体にし、akari を廃止した。1.x（akari 版）は `main` ブランチに凍結されている。

## ブランチと push

- `release`: 2.x の開発・配布ブランチ。descript.txt の `homeurl` がこのブランチの raw ファイルを直接読むので、**push した内容はすぐに利用者のネットワーク更新に出る**。push は頼まれたときだけ、updates2.dau / updates.txt と中身がそろっているのを確かめてから行う。
- `main`: 1.x（akari 版）。1.0.4 の利用者が参照しているので、1.0.5（中継版）以外の変更は入れない。

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
- 配布物からの除外は `developer_options.txt` で行っている。SSP で作る `build-nar.ps1`（既定）はこれを読むが、`-ListOnly` と `-Builtin` は `.narignore` しか読まないので、一覧は実際の nar と一致しない。

## 仕様の調べ方

- YAYA の文法と関数は https://yaya-shiori.github.io/yaya-docs/ を最新・正とする（MCP の ukagaka-doc は古いことがある）。
- PLUGIN/2.0 の仕様は UKADOC（https://ssp.shillest.net/ukadoc/manual/spec_plugin.html 、list_plugin_event.html）。
- 調べものはサブエージェント `ukagaka-researcher` に任せてよい。YAYA の関数の実際の挙動は `tools/shiori.ps1 -Eval` で確かめる。
- akari（1.x）の仕様は `__workspace/akari/akari_manual.html`（構文の説明は無い）。
