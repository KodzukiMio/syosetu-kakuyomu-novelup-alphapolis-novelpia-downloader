# syosetu-downloader

一个小工具，用于在日本小说网站下载小说章节。

*A small tool for downloading novel chapters from Japanese novel websites.*

## 需要 (Requirements)
- .Net Framework 8.0
- Proxy代理（中国大陆地区） *Proxy (for mainland China)*

## 使用说明 (Instructions)

### 参数 (Parameters)
- **base_url**: 目录URL | *Directory URL*
- **from**: 开始的章节下标（从1开始，不是URL后面的ID）| *Starting chapter index (starts from 1, not the ID in the URL)*
- **to**: 结束章节下标 | *Ending chapter index*
    - 可以填写 `-1`，表示全部爬取 (*You can set `to` as `-1`, which means downloading all chapters*)
    - 注意：syosetu不支持 `-1` 参数 (*Note: syosetu does not support the parameter `-1`)*
    
- **to_path**: 保存的文件夹名 | *Name of the folder where it will be saved*

### 支持的网站(Supported Websites)
*Supports*:
* Syosetu
* Kakuyomu
* Novelup
* Alphapolis

> alphapolis：无法爬取付费文章，需要Firefox。
> 
> _alphapolis_: Cannot scrape paid articles; requires Firefox.

### 示例(Examples)

```bash
syosetu-dl.exe https://novel18.syosetu.com/xxxxx 201 538 output
```

或者(Or):

```bash
syosetu-dl.exe https://ncode.syosetu.com/yyyyy 1 20 output 
```

其他平台(Other platforms):
```bash 
https://syosetu.org/novel/xxxxx 

https://kakuyomu.jp/works/xxxxx 

https://novelup.plus/story/xxxxx 

https://www.alphapolis.co.jp/novel/xxxxx/yyyyy  
```

### 命令格式(CMD Format)

```bash 
syosetu-dl.exe base_url from to to_path 
```

---
