# syosetu-downloader

一个小工具，用于在小说网站下载小说章节。

## 需要
- .Net Framework 8.0
- (可选) Proxy代理（如果是中国大陆地区）
- Firefox (爬取alphapolis需要火狐浏览器)

### 支持的网站

#### 通过命令行工具直接支持:
- Syosetu (ミッドナイトノベルズ | ムーンライトノベルズ | ノクターンノベルズ | 小説家になろう | 小説を読もう)
- Kakuyomu (カクヨム)
- Novelup (ノベルアップ)
- Alphapolis (アルファポリス)

#### 通过 Chrome 扩展支持:
- Syosetu.org (ハーメルン / Hamelin)
    - 请使用 `chrome-extensions\syosetu-org` 目录下的扩展进行下载。
- Novelpia
    - 请使用 `chrome-extensions\novelpia-download` 目录下的扩展进行下载。

> **alphapolis：** 无法爬取付费文章，需要Firefox。

> **syosetu.org (ハーメルン / Hamelin):** 由于该网站最近启用了Cloudflare防护，直接通过命令行工具下载已不再可行。请使用 `chrome-extensions\syosetu-org` 目录下的Chrome扩展进行下载。下载后的文件可以使用本工具的 `combine` 命令进行合并。

## 使用说明

### 参数
- **base_url**: 目录URL
- **from**: 开始章节的下标（从1开始，不是URL后面的ID）
- **to**: 结束章节的下标
    - 填写 `-1`，表示爬取到最后一章
    - 注意：Syosetu 网站 (ncode.syosetu.com, novel18.syosetu.com 等) 不支持 `-1` 参数（下载到最后一章）。请确保 `to` 参数指定的章节存在，否则程序可能会报错。您可以手动访问 Syosetu 网站的小说目录页面，确认最新的章节数量。
- **to_path**: 保存的文件夹名

  可选附加参数:
- **-fw** (`ForceWrite`): 如果文件已存在，强制写入。
- **-sttf file_name** (`SaveTitleTargetFile`): 将下载的章节标题保存到指定文件。
- **-si** (`SaveImmediately`): 立即写入标题文件，即使下载任务未完成。

#### 如何知道 Syosetu 小说最大章节数？
(此方法适用于 ncode.syosetu.com, novel18.syosetu.com 等)
Syosetu 小说的 URL 是连续的，所以你可以点击最后一章节，查看 URL 最后面的那个数字就知道最大章节数了。

例如：
`https://ncode.syosetu.com/n7918ic/19/`
最大章节数是 19。

### 示例

命令格式:
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

> **重要:** URL 是目录页面的地址,结尾不要带'/'字符。

#### 从文件读取待下载的文章
你可以通过提供一个包含章节索引列表的文件来指定要下载哪些特定章节，每个索引用逗号分隔。例如：
```textfile.txt:
79,104,180,193,119,146,276,186,217,80,112,190,202,213,234,205,256,54,284...
```

命令格式:
```bash
syosetu-dl base_url file_path to_path ...
```

```bash
syosetu-dl https://novelup.plus/story/xxxxx chapters.txt output -sttf titles.txt -fw
```

例如，如果你的文本文件路径为 "chapters.txt"，并且你想将内容保存到 "output" 文件夹中，你可以使用以下命令：
```bash
syosetu-dl https://novel18.syosetu.com/xxxxx chapters.txt output
```

### 支持的URL (CLI工具用)
```
https://ncode.syosetu.com/xxxxx
https://novel18.syosetu.com/xxxxx
https://kakuyomu.jp/works/xxxxx
https://novelup.plus/story/xxxxx
https://www.alphapolis.co.jp/novel/xxxxx/yyyyy
```
(对于 `https://syosetu.org/novel/xxxxx`，请使用下述 Chrome 扩展。)

### 打包小说文件
将指定目录中已下载的小说文件合并到输出文件路径。
```bash
syosetu-dl combine from_folder to_file_path
```

使用正则表达式选择要包含的文件名，将指定目录中已下载的小说文件合并到输出文件路径。
```bash
syosetu-dl combine from_folder to_file_path -reg select_regex
```
- `combine`为打包关键词, `from_folder`为下载小说所在的目录, `to_file_path`为输出文件路径, `-reg`为可选参数, 值为正则表达式, 用于对打包文件名进行选择。

对于使用 Chrome 扩展从 Novelpia 下载的小说，您可以使用 `-npa` 选项自动解析文件名，或使用 `-seq "(?<=novel-\d+-)\d+"` 选项指定用于排序的数字序列。

对于使用 Chrome 扩展从 Syosetu.org (Hamelin) 或 Novelpia 下载的小说，此 `combine` 命令非常有用。

例如:
```bash
syosetu-dl combine mynovel out.txt -reg Chapter-[3-8][1-2]
```
```bash
syosetu-dl combine mynovel out.txt -npa
```
```bash
syosetu-dl combine x out.txt -seq "(?<=novel-\d+-)\d+"
```

# Chrome 扩展

## kakuyomu chrome mark Extension
- Kakuyomu Chrome拓展,用于屏蔽黑名单用户与标记关注用户。
- 详情请见: `\chrome-extensions\kakuyomu-mark` 目录。

## Syosetu.org (Hamelin) Chrome Download Extension
- **用途:** 用于从 `syosetu.org` (ハーメルン) 下载小说章节。
- **原因:** `syosetu.org` 网站启用了 Cloudflare 防护，导致命令行工具难以直接访问。此扩展可以帮助绕过此限制。
- **使用方法:** 安装扩展后，在 `syosetu.org` 的小说页面使用扩展进行下载。下载的章节文件可以后续使用本工具的 `syosetu-dl combine ...` 命令进行合并。

支持的网站:
* `https://syosetu.org/novel/*`
* `https://syosetu.org/novel_list/*` (目录页)

详情请见: `\chrome-extensions\syosetu-org` 目录。

## Novelpia Chrome Download Extension
支持的网站:
* `https://novelpia.jp/novel/*`
* `https://novelpia.jp/viewer/*`
* `https://novelpia.com/novel/*`
* `https://novelpia.com/viewer/*`

详情请见: `\chrome-extensions\novelpia-download` 目录。

# 其他

未来更新计划:
0. 实现异步同时下载多个小说章节。
1. 支持 Syosetu 网站 (ncode.syosetu.com, novel18.syosetu.com 等) 的 `-1` 参数。
2. 支持小说自动更新。