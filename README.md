# syosetu-downloader

一个小工具，用于在日本小说网站下载小说章节。  
*A small tool for downloading novel chapters from Japanese novel websites.*  
*日本の小説サイトから小説の章をダウンロードするためのツールです。*

## 需要 (Requirements) / 必要条件
- .Net Framework 8.0
- (可选|Optional) Proxy代理（如果是中国大陆地区） *Proxy (If for mainland China)* *プロキシ（中国本土の場合）*
- Firefox (爬取alphapolis需要火狐浏览器 | alphapolis requirement | alphapolisにはFirefoxが必要)

## 使用说明 (Instructions) / 使用方法

### 参数 (Parameters) / パラメータ
- **base_url**: 目录URL | *Directory URL* | ディレクトリURL
- **from**: 开始章节的下标（从1开始，不是URL后面的ID）| *Starting chapter index (starts from 1, not the ID in the URL)* | 開始章インデックス（1から開始、URL後ろのIDではない）
- **to**: 结束章节的下标 | *Ending chapter index* | 終了章インデックス 
    - 填写 `-1`，表示爬取到最后一章 (*You can set `to` as `-1`, which means downloading to end chapter*) (*`to`に `−１` を設定すると最後までダウンロードします*)
    - 注意：syosetu不支持 `−１` 参数 (*Note: syosetu does not support the parameter `−１`) (*注意：syosetuはパラメータ「−１」をサポートしていません*)

    
### 支持的网站(Supported Websites)
Supports:
対応ウェブサイト：
* Syosetu(ミッドナイトノベルズ|ムーンライトノベルズ|ノクターンノベルズ|小説家になろう|ハーメルン|小説を読もう)
* Kakuyomu(カクヨム)
* Novelup(ノベルアップ)
* Alphapolis(アルファポリス)

> alphapolis：无法爬取付费文章，需要Firefox。
> _alphapolis_: Cannot scrape paid articles; requires Firefox.
> アルファポリス：有料記事はスクレイピングできません；Firefoxが必要です。

### 示例(Examples)/例:

```bash
syosetu-dl https://novel18.syosetu.com/xxxxx 201 538 output
```

或者/Or/または:

```bash
syosetu-dl https://www.alphapolis.co.jp/novel/xxxxx/yyyyy 1 -1 output 
```
IMPORTANT(重要): URL 是目录页面的地址,结尾不要带'/'字符.  
(The directory URL is missing the trailing '/' character.)   
(URL はディレクトリページアドレスであり、末尾に '/' キャラクタを含めないでください。)

### 支持的URL(Supported URLs)/対応するURL:
```bash
https://ncode.syosetu.com/xxxxx

https://novel18.syosetu.com/xxxxx

https://syosetu.org/novel/xxxxx 

https://kakuyomu.jp/works/xxxxx 

https://novelup.plus/story/

https://www.alphapolis.co.jp/
```

### 命令格式(CMD Format)/コマンド形式:

```bash 
syosetul-dl base_url from to to_path 
```
