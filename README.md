# syosetu-downloader
一个小工具,用于在日本小说网站下载小说章节:

A small tool for downloading novel chapters from the japan novel website:

需要(Requirements):.Net Framework 8.0,proxy代理(中国大陆地区)

使用说明(Instructions):

参数(Parameters):base_url(目录url|directory url) from(开始的章节ID:通过url查看|starting chapter ID: view through url) to(结束章节ID|ending chapter ID) to_path(保存的文件夹名|name of the folder where it will be saved)

注意:to可以填写-1,表示全部爬取(syosetu不支持-1参数)

支持:syosetu,kakuyomu,novelup,alphapolis

示例(Example):syosetu-dl.exe https://novel18.syosetu.com/xxxxx 201 538 output

或者(Or):syosetu-dl.exe https://ncode.syosetu.com/yyyyy 1 20 output

https://kakuyomu.jp/works/xxxxx

https://novelup.plus/story/xxxxx

https://www.alphapolis.co.jp/novel/xxxxx/yyyyy (无法爬取付费文章,需要Firefox)

cmd:syosetu-dl.exe base_url from to to_path
