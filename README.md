# syosetu-downloader

一个小工具，用于在日本小说网站下载小说章节。  
*A small tool for downloading novel chapters from Japanese novel websites.*  
*日本の小説サイトから小説の章をダウンロードするためのツールです。*

## 需要 (Requirements) / 必要条件
- .Net Framework 8.0
- (可选) Proxy代理（如果是中国大陆地区）  
  *Optional: Proxy (If for mainland China)*  
  *プロキシ（中国本土の場合）*
- Firefox (爬取alphapolis需要火狐浏览器)  
  *alphapolis requirement: requires Firefox*  
  *alphapolisにはFirefoxが必要*

### 支持的网站 (Supported Websites) / 対応ウェブサイト
- Syosetu (ミッドナイトノベルズ | ムーンライトノベルズ | ノクターンノベルズ | 小説家になろう | ハーメルン | 小説を読もう)
- Kakuyomu (カクヨム)
- Novelup (ノベルアップ)
- Alphapolis (アルファポリス)

> alphapolis：无法爬取付费文章，需要Firefox。  
> _alphapolis_: Cannot scrape paid articles; requires Firefox.  
> アルファポリス：有料記事はスクレイピングできません；Firefoxが必要です。

## 使用说明 (Instructions) / 使用方法

### 参数 (Parameters) / パラメータ
- **base_url**: 目录URL  
  *Directory URL*  
  ディレクトリURL
- **from**: 开始章节的下标（从1开始，不是URL后面的ID）  
  *Starting chapter index (starts from 1, not the ID in the URL)*  
  開始章インデックス（1から開始、URL後ろのIDではない）
- **to**: 结束章节的下标  
  *Ending chapter index*  
  終了章インデックス 
    - 填写 `-1`，表示爬取到最后一章  
      *You can set `to` as `-1`, which means downloading to end chapter*  
      *`to`に `-1` を設定すると最後までダウンロードします*
    - 注意：syosetu不支持 `-1` 参数  
      *Note: syosetu does not support the parameter `-1`*  
      *注意：syosetuはパラメータ「−１」をサポートしていません*
- **to_path**: 保存的文件夹名  
  *Name of the folder where it will be saved*  
  保存フォルダ名
  
  可选附加参数(optional other params):
  
- **-fw** -> ForceWrite: 如果文件已存在，强制写入.
  *Forces writing to the file even if it already exists*  
  *(オプション) ファイルが既に存在する場合でも、強制的に書き込みます*
- **-sttf file_name** -> SaveTitleTargetFile: 将下载的章节标题保存到指定文件  
  *Saves downloaded chapter titles to a specified file*  
  *(オプション) ダウンロードした章のタイトルを指定されたファイルに保存します*
- **-si** -> SaveImmediately: 立即写入标题文件，即使下载任务未完成  
  *Writes to the title file immediately, even if the download task is not completed*  
  *(オプション) ダウンロードタスクが完了していなくても、すぐにタイトルファイルに書き込みます*
  
### 示例 (Examples) / 例

命令格式 (CMD Format) / コマンド形式:
```bash 
syosetul-dl base_url from to to_path ...
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

> 重要 (IMPORTANT): URL 是目录页面的地址,结尾不要带'/'字符。  
> *The directory URL is missing the trailing '/' character.*  
> *URL はディレクトリページアドレスであり、末尾に '/' キャラクタを含めないでください。*

#### 从文件读取待下载的文章 (Read chapters to download from file) / ファイルからダウンロードするチャプターを読み込む
你可以通过提供一个包含章节索引列表的文件来指定要下载哪些特定章节，每个索引用逗号分隔。例如：  
*You can specify specific chapters to download by providing a file containing a list of chapter indices separated by commas. For example:*  
*特定のチャプターインデックス一覧がコンマ区切りで記載されたファイルを提供することで、どれらか特定なチャプターのみダウンロードできます。例えば:*
```textfile.txt:
79,104,180,193,119,146,276,186,217,80,112,190,202,213,234,205,256,54,284...
```

命令格式 (CMD Format) / コマンド形式:
```bash 
syosetul-dl base_url file_path to_path ...
```

```bash
syosetu-dl https://novelup.plus/story/xxxxx chapters.txt output -sttf titles.txt -fw
```

例如，如果你的文本文件路径为 "chapters.txt"，并且你想将内容保存到 "output" 文件夹中，你可以使用以下命令：  
*For instance if your text file path is "chapters.txt" and you want to save content into an "output" folder you could use following command:*  
*例えばテキストファイルパスが「chapters.txt」で、「output」フォルダーに保存したい場合、次のコマンドをご利用いただけます:*
```bash 
syosetul-dl https://novel18.syosetu.com/xxxxx chapters.txt output 
```

### 支持的URL (Supported URLs) / 対応するURL
```bash
https://ncode.syosetu.com/xxxxx

https://novel18.syosetu.com/xxxxx

https://syosetu.org/novel/xxxxx 

https://kakuyomu.jp/works/xxxxx 

https://novelup.plus/story/xxxxx 

https://www.alphapolis.co.jp/novel/xxxxx/yyyyy
```

### chrome extension
- kakuyomu chrome拓展,用于屏蔽黑名单用户与标记关注用户.
- Kakuyomu Chrome Extension for Blocking Blacklisted Users and Highlighting Followed Users.
- カクヨム Chrome 拡張機能：ブラックリストユーザーの非表示とフォローユーザーの強調表示.

未来的更新计划: 

0. 实现异步同时下载多个小说章节
1. 支持syosetu网站的-1参数.
2. 支持小说自动更新.

Future Update Plan:

0. Implement asynchronous simultaneous download of multiple novel chapters
1. Support for the -1 parameter on the syosetu website.
2. Support for automatic novel updates.

将来の更新計画:

0. 複数の小説章を非同期で同時にダウンロードする実装
1. syosetuサイトの-1パラメータをサポート.
2. 小説の自動更新をサポート.

