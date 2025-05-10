# syosetu-downloader

A small tool for downloading novel chapters from novel websites.

---
**Other Languages:**
- [中文说明 (Chinese)](README_zh.md)
- [日本語の説明 (Japanese)](README_ja.md)
---

## Requirements
- .Net Framework 8.0
- (Optional) Proxy (If for mainland China)
- Firefox (alphapolis requirement: requires Firefox)

### Supported Websites

#### Directly supported by CLI tool:
- Syosetu (ミッドナイトノベルズ | ムーンライトノベルズ | ノクターンノベルズ | 小説家になろう | 小説を読もう)
- Kakuyomu (カクヨム)
- Novelup (ノベルアップ)
- Alphapolis (アルファポリス)

#### Supported via Chrome Extension:
- Syosetu.org (ハーメルン / Hamelin)
    - Please use the extension in the `chrome-extensions\syosetu-org` directory for downloading.
- Novelpia
    - Please use the extension in the `chrome-extensions\novelpia-download` directory for downloading.

> **alphapolis:** Cannot scrape paid articles; requires Firefox.

> **syosetu.org (Hamelin):** Due to recent Cloudflare protection on this site, direct download via the command-line tool is no longer feasible. Please use the Chrome extension located in the `chrome-extensions\syosetu-org` directory for downloading. Downloaded files can then be merged using the `combine` command of this tool.

## Instructions

### Parameters
- **base_url**: Directory URL
- **from**: Starting chapter index (starts from 1, not the ID in the URL)
- **to**: Ending chapter index
    - You can set `to` as `-1`, which means downloading to the end chapter
    - Note: The Syosetu websites (ncode.syosetu.com, novel18.syosetu.com, etc.) do not support the `-1` parameter (download to the last chapter). Please ensure that the chapter specified by the `to` parameter exists, otherwise the program may report an error. You can manually visit the novel directory page of the Syosetu website to confirm the latest number of chapters.
- **to_path**: Name of the folder where it will be saved

  Optional other params:
- **-fw** (`ForceWrite`): Forces writing to the file even if it already exists.
- **-sttf file_name** (`SaveTitleTargetFile`): Saves downloaded chapter titles to a specified file.
- **-si** (`SaveImmediately`): Writes to the title file immediately, even if the download task is not completed.

#### How to find the maximum chapter number of a Syosetu novel?
(This method applies to ncode.syosetu.com, novel18.syosetu.com, etc.)
Syosetu novel URLs are sequential. You can find the maximum chapter number by clicking on the last chapter and checking the number at the end of the URL.

For example:
`https://ncode.syosetu.com/n7918ic/19/`
The maximum chapter number is 19.

### Examples

CMD Format:
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

> **IMPORTANT:** The URL is the directory page address; do not include a trailing '/' character.

#### Read chapters to download from file
You can specify specific chapters to download by providing a file containing a list of chapter indices separated by commas. For example:
```textfile.txt:
79,104,180,193,119,146,276,186,217,80,112,190,202,213,234,205,256,54,284...
```

CMD Format:
```bash
syosetu-dl base_url file_path to_path ...
```

```bash
syosetu-dl https://novelup.plus/story/xxxxx chapters.txt output -sttf titles.txt -fw
```

For instance, if your text file path is "chapters.txt" and you want to save content into an "output" folder, you could use the following command:
```bash
syosetu-dl https://novel18.syosetu.com/xxxxx chapters.txt output
```

### Supported URLs (for CLI tool)
```
https://ncode.syosetu.com/xxxxx
https://novel18.syosetu.com/xxxxx
https://kakuyomu.jp/works/xxxxx
https://novelup.plus/story/xxxxx
https://www.alphapolis.co.jp/novel/xxxxx/yyyyy
```
(For `https://syosetu.org/novel/xxxxx`, please use the Chrome extension mentioned below.)

### Combine files
Combine downloaded novel files from the specified directory into the output file path.
```bash
syosetu-dl combine from_folder to_file_path
```

Combine downloaded novel files from the specified directory into the output file path, using a regex to select the filenames to include.
```bash
syosetu-dl combine from_folder to_file_path -reg select_regex
```
- `combine` is the keyword for combining, `from_folder` is the directory where downloaded novels are located, `to_file_path` is the output file path, and `-reg` is an optional parameter whose value is a regular expression used to select filenames for packaging.

For novels downloaded from Novelpia using a Chrome extension, you can use the `-npa` option to automatically parse the filename, or use the `-seq "(?<=novel-\d+-)\d+"` option to specify the extracted sequence of sorting numbers.

This `combine` command is very useful for novels downloaded from Syosetu.org (Hamelin) or Novelpia using their respective Chrome extensions.

Example:
```bash
syosetu-dl combine mynovel out.txt -reg Chapter-[3-8][1-2]
```
```bash
syosetu-dl combine mynovel out.txt -npa
```
```bash
syosetu-dl combine x out.txt -seq "(?<=novel-\d+-)\d+"
```

# Chrome Extensions

## kakuyomu chrome mark Extension
- Kakuyomu Chrome Extension for blocking blacklisted users and highlighting followed users.
- For more details, see the `\chrome-extensions\kakuyomu-mark` directory.

## Syosetu.org (Hamelin) Chrome Download Extension
- **Purpose:** For downloading novel chapters from `syosetu.org` (Hamelin).
- **Reason:** The `syosetu.org` website has enabled Cloudflare protection, making it difficult for command-line tools to access directly. This extension helps bypass this limitation.
- **Usage:** After installing the extension, use it on the novel pages of `syosetu.org` to download. The downloaded chapter files can then be merged using this tool's `syosetu-dl combine ...` command.

Supported Websites:
* `https://syosetu.org/novel/*`
* `https://syosetu.org/novel_list/*` (Table of Contents page)

For more details, see the `\chrome-extensions\syosetu-org` directory.

## Novelpia Chrome Download Extension
Supported Websites:
* `https://novelpia.jp/novel/*`
* `https://novelpia.jp/viewer/*`
* `https://novelpia.com/novel/*`
* `https://novelpia.com/viewer/*`

For more details, see the `\chrome-extensions\novelpia-download` directory.

# Other

Future Update Plan:
0. Implement asynchronous simultaneous download of multiple novel chapters.
1. Support for the `-1` parameter on Syosetu websites (ncode.syosetu.com, novel18.syosetu.com, etc.).
2. Support for automatic novel updates.