# syosetu-downloader
一个小工具,用于在syosetu网站下载小说章节:

A small tool for downloading novel chapters from the syosetu website:

需要:.Net Framework 8.0

Requirements: .Net Framework 8.0

使用说明:

Instructions:

参数:base_url(目录url) from(开始的章节ID:通过url查看) to(结束章节ID) to_path(保存的文件夹名)

Parameters: base_url (directory url) from (starting chapter ID: view through url) to (ending chapter ID) to_path (name of the folder where it will be saved)

示例:https://novel18.syosetu.com/nxxxxcv/ 201 538 output

Example: https://novel18.syosetu.com/nxxxxcv/ 201 538 output

或者:https://ncode.syosetu.com/nxxxxxik/ 1 20 output

Or: https://ncode.syosetu.com/nxxxxxik/ 1 20 output

cmd:syosetu-dl.exe base_url from to to_path
