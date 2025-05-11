# syosetu-downloader

小説サイトから小説の章をダウンロードするためのツールです。

## 必要条件
- .Net Framework 8.0
- (オプション) プロキシ（中国本土の場合）
- Firefox (alphapolisにはFirefoxが必要)

### 対応ウェブサイト

#### CLIツールで直接サポート:
- Syosetu (ミッドナイトノベルズ | ムーンライトノベルズ | ノクターンノベルズ | 小説家になろう | 小説を読もう)
- Kakuyomu (カクヨム)
- Novelup (ノベルアップ)
- Alphapolis (アルファポリス)

#### Chrome拡張機能経由でサポート:
- Syosetu.org (ハーメルン / Hamelin)
    - ダウンロードには `chrome-extensions\syosetu-org` ディレクトリ内の拡張機能を使用してください。
- Novelpia
    - ダウンロードには `chrome-extensions\novelpia-download` ディレクトリ内の拡張機能を使用してください。

> **alphapolis：** 有料記事はスクレイピングできません；Firefoxが必要です。

> **syosetu.org (ハーメルン / Hamelin):** このサイトで最近Cloudflare保護が有効になったため、コマンドラインツールによる直接ダウンロードは実行できなくなりました。ダウンロードには `chrome-extensions\syosetu-org` ディレクトリにあるChrome拡張機能を使用してください。ダウンロードしたファイルは、このツールの `combine` コマンドを使用して結合できます。

## 使用方法

### パラメータ
- **base_url**: ディレクトリURL
- **from**: 開始章インデックス（1から開始、URL後ろのIDではない）
- **to**: 終了章インデックス
    - `to`に `-1` を設定すると最後までダウンロードします
    - 注意：Syosetuサイト（ncode.syosetu.com、novel18.syosetu.comなど）では、`-1`パラメータ（最後の章までダウンロード）はサポートされていません。`to`パラメータで指定された章が存在することを確認してください。そうでない場合、プログラムはエラーを報告する可能性があります。Syosetuの小説ディレクトリページに手動でアクセスして、最新の章数を確認できます。
- **to_path**: 保存フォルダ名

  オプションの追加パラメータ:
- **-fw** (`ForceWrite`): ファイルが既に存在する場合でも、強制的に書き込みます。
- **-sttf file_name** (`SaveTitleTargetFile`): ダウンロードした章のタイトルを指定されたファイルに保存します。
- **-si** (`SaveImmediately`): ダウンロードタスクが完了していなくても、すぐにタイトルファイルに書き込みます。

#### Syosetu小説の最大章番号を確認するには？
(この方法は ncode.syosetu.com、novel18.syosetu.com などに適用されます)
Syosetu小説のURLは連続しています。最後の章をクリックして、URLの末尾にある数字を確認することで、最大章番号を確認できます。

例えば：
`https://ncode.syosetu.com/n7918ic/19/`
最大章番号は19です。

### 例

コマンド形式:
```bash
syosetu-dl base_url from to to_path ...
```

```bash
syosetu-dl https://novel18.syosetu.com/xxxxx 201 538 output
```

```bash
syosetu-dl https://www.alphapolis.co.jp/novel/xxxxx/yyyyy 1 -1 output
```

```bash
syosetu-dl https://kakuyomu.jp/works/xxxxx 1 -1 output -fw -sttf titles.txt -si
```

```bash
syosetu-dl https://novelup.plus/story/xxxxx 10 -1 output -sttf titles.txt -fw
```

> **重要:** URL はディレクトリページアドレスであり、末尾に '/' キャラクタを含めないでください。

#### ファイルからダウンロードするチャプターを読み込む
特定のチャプターインデックス一覧がコンマ区切りで記載されたファイルを提供することで、ダウンロードする特定のチャプターを指定できます。例えば:
```textfile.txt:
79,104,180,193,119,146,276,186,217,80,112,190,202,213,234,205,256,54,284...
```

コマンド形式:
```bash
syosetu-dl base_url file_path to_path ...
```

```bash
syosetu-dl https://novelup.plus/story/xxxxx chapters.txt output -sttf titles.txt -fw
```

例えば、テキストファイルのパスが「chapters.txt」で、内容を「output」フォルダーに保存したい場合、次のコマンドを使用できます:
```bash
syosetu-dl https://novel18.syosetu.com/xxxxx chapters.txt output
```

### 対応するURL (CLIツール用)
```
https://ncode.syosetu.com/xxxxx
https://novel18.syosetu.com/xxxxx
https://kakuyomu.jp/works/xxxxx
https://novelup.plus/story/xxxxx
https://www.alphapolis.co.jp/novel/xxxxx/yyyyy
```
(`https://syosetu.org/novel/xxxxx` については、下記のChrome拡張機能をご利用ください。)

### 小説ファイルを結合する
指定されたディレクトリからダウンロードされた小説ファイルを結合し、出力ファイルパスに保存します。
```bash
syosetu-dl combine from_folder to_file_path
```

正規表現を使用して含めるファイル名を選択し、指定されたディレクトリからダウンロードされた小説ファイルを結合して出力ファイルパスに保存します。
```bash
syosetu-dl combine from_folder to_file_path -reg select_regex
```
- `combine`は結合のキーワード、`from_folder`はダウンロードされた小説が保存されているディレクトリ、`to_file_path`は出力ファイルパス、`-reg`はオプションのパラメータで、値はパッケージ化するファイル名を選択するための正規表現です。

Chrome拡張機能を使用してNovelpiaからダウンロードした小説の場合、`-npa`オプションを使用してファイル名を自動的に解析するか、`-seq "(?<=novel-\d+-)\d+"`オプションを使用してソート用の数字のシーケンスを指定できます。

この `combine` コマンドは、Syosetu.org (ハーメルン) または Novelpia からそれぞれのChrome拡張機能を使用してダウンロードされた小説に非常に役立ちます。

例:
```bash
syosetu-dl combine mynovel out.txt -reg Chapter-[3-8][1-2]
```
```bash
syosetu-dl combine mynovel out.txt -npa
```
```bash
syosetu-dl combine x out.txt -seq "(?<=novel-\d+-)\d+"
```

# Chrome拡張機能

## kakuyomu chrome mark Extension
- カクヨム Chrome 拡張機能：ブラックリストユーザーの非表示とフォローユーザーの強調表示。
- 詳細については、`\chrome-extensions\kakuyomu-mark` ディレクトリを参照してください。

## Syosetu.org (Hamelin) Chrome Download Extension
- **目的:** `syosetu.org` (ハーメルン) から小説の章をダウンロードするために使用します。
- **理由:** `syosetu.org` ウェブサイトはCloudflare保護を有効にしているため、コマンドラインツールが直接アクセスすることが困難です。この拡張機能はこの制限を回避するのに役立ちます。
- **使用方法:** 拡張機能をインストールした後、`syosetu.org` の小説ページで拡張機能を使用してダウンロードします。ダウンロードされた章ファイルは、その後、このツールの `syosetu-dl combine ...` コマンドを使用して結合できます。

対応ウェブサイト:
* `https://syosetu.org/novel/*`

詳細については、`\chrome-extensions\syosetu-org` ディレクトリを参照してください。

## Novelpia Chrome Download Extension
対応ウェブサイト:
* `https://novelpia.jp/novel/*`
* `https://novelpia.jp/viewer/*`
* `https://novelpia.com/novel/*`
* `https://novelpia.com/viewer/*`

詳細については、`\chrome-extensions\novelpia-download` ディレクトリを参照してください。

# その他

将来の更新計画:
0. 複数の小説章を非同期で同時にダウンロードする機能を実装します。
1. Syosetuウェブサイト（ncode.syosetu.com、novel18.syosetu.comなど）での`-1`パラメータのサポート。
2. 小説の自動更新をサポートします。