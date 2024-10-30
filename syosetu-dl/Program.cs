using HtmlAgilityPack;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium;
using System.Text;
using System.Text.RegularExpressions;
using System.Linq.Expressions;
using System.IO;

namespace syosetu_dl {
    internal class Program {
        public enum ParamType {
            SaveTitleTargetFile,
            ForceWrite,
            SaveImmediately,
            regex_parse,
            seq_match,
            novelpia,
        }
        public delegate Task<StringBuilder> NovelHandle(string base_url, int i);
        public static NovelHandle? novel_hd = null;
        public static List<string> id_collection = new List<string>();
        public static bool req_main = true;
        public static bool to_end = false;
        public static IWebDriver? driver;
        public static Dictionary<string, ParamType> param2id = new Dictionary<string, ParamType> {
            { "-sttf",ParamType.SaveTitleTargetFile},
            {"-fw",ParamType.ForceWrite},
            { "-si",ParamType.SaveImmediately},
            { "-reg",ParamType.regex_parse},
            { "-seq",ParamType.seq_match},
            { "-npa",ParamType.novelpia},
        };
        public static bool b_sttf = false;
        public static bool b_fw = true;
        public static bool b_si = false;
        public static bool b_reg = false;
        public static string? s_reg;
        public static string? s_sttf;
        public static string? s_seq=null;
        public static StringBuilder? sttf;
        public static string msg = "\nConnection timed out or IP request rate limit reached,some website has limited bandwidth, \nso if you encounter a connection timeout, don't worry, the program will automatically wait for a while and try to continue download.";
        public static void SaveImme() {
            if (b_sttf && sttf != null) {
                string sttfbd = sttf.ToString();
                if (s_sttf != null) WriteText(ref s_sttf, ref sttfbd, b_fw);
            }
        }
        public static void AppendTitle(string? title, int idx) {
            if (sttf != null && title != null) sttf.Append($"Chapter-{idx}:").Append(title).Append('\n');
        }
        public static void WriteText(ref string filePath, ref string content, bool ignore_noexist) {
            try {
                if (!(File.Exists(filePath) && ignore_noexist)) {
                    string? directoryPath = Path.GetDirectoryName(filePath);
                    if (directoryPath == null) throw new Exception("GetDirectoryName error");
                    if (!Directory.Exists(directoryPath)) Directory.CreateDirectory(directoryPath);
                    if (ignore_noexist || !File.Exists(filePath)) {
                        using (FileStream fs = File.Create(filePath)) {
                            byte[] contents = new UTF8Encoding(true).GetBytes(content);
                            fs.Write(contents, 0, contents.Length);
                        }
                    } else {
                        using (FileStream fs = File.Open(filePath, FileMode.Truncate)) {
                            byte[] contents = new UTF8Encoding(true).GetBytes(content);
                            fs.Write(contents, 0, contents.Length);
                        }
                    }
                    Console.WriteLine($"File {filePath} written successfully.");
                } else Console.WriteLine($"File {filePath} exist.");
            } catch (Exception ex) {
                Console.WriteLine($"File error.{filePath},{ignore_noexist},{ex}");
            }
        }
        //https://ncode.syosetu.com/xxxxx
        //https://novel18.syosetu.com/xxxxx
        public static async Task<StringBuilder> syosetu(string base_url, int i) {
            StringBuilder str = new StringBuilder();
            using (HttpClient client = new HttpClient()) {
                client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0");
                client.DefaultRequestHeaders.Add("Cookie", "over18=yes");
                var doc = new HtmlDocument();
                string url = $"{base_url}/{i}/";
            single_page:
                doc.LoadHtml(await (await client.GetAsync(url)).Content.ReadAsStringAsync());
                var title = doc.DocumentNode.SelectSingleNode("//p[@class='novel_subtitle']");
                if (title != null) {
                    AppendTitle(title.InnerText, i);
                    str.Append(title.InnerText).Append('\n');
                }
                var pTags = doc.DocumentNode.SelectNodes("//p[starts-with(@id, 'L')]");
                if (pTags != null) {
                    foreach (var p in pTags) str.Append(p.InnerText).Append('\n');
                } else {
                    url = $"{base_url}/";
                    goto single_page;
                }
            };
            return str;
        }
        //https://syosetu.org/novel/xxxxx
        public static async Task<StringBuilder> syosetu_org(string base_url, int i) {
            StringBuilder str = new StringBuilder();
            using (HttpClient client = new HttpClient()) {
                client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0");
                client.DefaultRequestHeaders.Add("Cookie", "over18=yes");
                var doc = new HtmlDocument();
                doc.LoadHtml(await (await client.GetAsync($"{base_url}/{i}.html")).Content.ReadAsStringAsync());
                var pTags = doc.DocumentNode.SelectNodes("//p");
                if (pTags != null) {
                    var maegaki = doc.DocumentNode.SelectSingleNode("//div[@id='maegaki']");
                    if (maegaki != null) str.Append(maegaki.InnerText);
                    var span_fs = doc.DocumentNode.SelectNodes("//span[@style='font-size:120%']");
                    if (span_fs != null) {
                        str.Append('\n').Append(span_fs[1].InnerText).Append('\n');
                        AppendTitle(span_fs[1].InnerText, i);
                    }
                    var filteredParagraphs = pTags.Where(p => (new Regex("^[0-9]+$")).IsMatch(p.GetAttributeValue("id", "")));
                    foreach (var node in filteredParagraphs) str.Append(node.InnerText).Append('\n');
                } else {
                    throw new Exception("html is empty.");
                }
            };
            return str;
        }
        //https://kakuyomu.jp/works/xxxxx
        public static async Task<StringBuilder> kakuyomu(string base_url, int i) {
            StringBuilder str = new StringBuilder();
            using (HttpClient client = new HttpClient()) {
                client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0");
                if (req_main) {
                    MatchCollection matches = Regex.Matches(await (await client.GetAsync($"{base_url}")).Content.ReadAsStringAsync(), "\"Episode:\\d+\":\\s*\\{[^}]*\\}");
                    foreach (Match match in matches) {
                        Match idMatch = Regex.Match(match.Value, @"""id"":\s*""([^""]*)""");
                        if (idMatch.Success) id_collection.Add(idMatch.Groups[1].Value);
                    };
                    req_main = false;
                }
                HttpResponseMessage req = await client.GetAsync($"{base_url}/episodes/{id_collection[(i - 1) < 0 ? 0 : (i - 1)]}");
                var doc = new HtmlDocument();
                doc.LoadHtml(await req.Content.ReadAsStringAsync());
                var title = doc.DocumentNode.SelectSingleNode("//p[@class='widget-episodeTitle js-vertical-composition-item']");
                if (title != null) {
                    str.Append(title.InnerText).Append("\n");
                    AppendTitle(title.InnerText, i);
                }
                var pTags = doc.DocumentNode.SelectNodes("//p[starts-with(@id, 'p')]");
                for (int idx = 0; idx < pTags.Count; ++idx) str.Append(pTags[idx].InnerText).Append('\n');
            }
            return str;
        }
        //https://novelup.plus/story/xxxxx
        public static async Task<StringBuilder> novelup(string base_url, int idx) {
            StringBuilder str = new StringBuilder();
            using (HttpClient client = new HttpClient()) {
                client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0");
                if (req_main) {
                    string pageContent = await (await client.GetAsync($"{base_url}")).Content.ReadAsStringAsync();
                    int fidx = pageContent.IndexOf("総エピソード数：") + 8;
                    int mpage = (int)Math.Ceiling(int.Parse(pageContent.Substring(fidx, pageContent.IndexOf("話</p>") - fidx).Replace(",", "")) / 100.0f);
                    List<string> page_str = new List<string> { pageContent };
                    for (int i = 2; i <= mpage; ++i) page_str.Add(await (await client.GetAsync($"{base_url}?p={i}")).Content.ReadAsStringAsync());
                    for (int i = 0; i < page_str.Count; ++i) {
                        MatchCollection matches = Regex.Matches(page_str[i], @"href=""([^""]*)""");
                        foreach (Match match in matches) if (match.Success && match.Groups[1].Value.IndexOf($"{base_url}/") != -1 && match.Groups[1].Value.IndexOf("/comment") == -1) id_collection.Add(match.Groups[1].Value);
                    }
                    string laststr = id_collection.Last();
                    id_collection.RemoveAll(item => item == id_collection.Last());
                    id_collection.Add(laststr);
                    req_main = false;
                }
                var doc = new HtmlDocument();
                doc.LoadHtml(await (await client.GetAsync(id_collection[idx - 1 < 0 ? 0 : idx - 1])).Content.ReadAsStringAsync());
                var title = doc.DocumentNode.SelectSingleNode("//div[@class='episode_title']");
                if (title != null) {
                    str.Append(title.InnerText).Append('\n');
                    AppendTitle(title.InnerText, idx);
                }
                str.Append(doc.DocumentNode.SelectSingleNode("//p[@id='episode_content']").InnerText);
            }
            return str;
        }
        public static IWebDriver CreateInstance() {
            var encodingProvider = CodePagesEncodingProvider.Instance;
            Encoding.RegisterProvider(encodingProvider);
            string appDataPath = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            string profilePath = Path.Combine(appDataPath, "Mozilla\\Firefox\\Profiles\\");
            string profileDir = Directory.GetDirectories(profilePath)[0];
            FirefoxProfile profile = new FirefoxProfile(profileDir);
            var options = new FirefoxOptions();
            options.AddArgument("--disable-web-security");
            options.AddArgument("--allowed-ips");
            options.Profile = profile;
            IWebDriver driver = new FirefoxDriver(options);
            return driver;
        }
        //https://www.alphapolis.co.jp/novel/xxxxx/yyyyy
        //Unable to crawl paid articles, requires Firefox browser
        public static async Task<StringBuilder> alphapolis(string base_url, int i) {
            StringBuilder str = new StringBuilder();
            using (HttpClient client = new HttpClient()) {
                client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0");
                if (req_main) {
                    driver = CreateInstance();
                    var doc = new HtmlDocument();
                    doc.LoadHtml(await (await client.GetAsync($"{base_url}")).Content.ReadAsStringAsync());
                    var pTags = doc.DocumentNode.SelectNodes("//div[@class='episode ']");
                    foreach (var tag in pTags) id_collection.Add(tag.SelectSingleNode(".//a[starts-with(@href, 'https://www.alphapolis.co.jp/')]").Attributes["href"].Value);
                    req_main = false;
                }
                string url = id_collection[i - 1 < 0 ? 0 : i - 1];
                if (driver != null) {//Bypass captcha and dynamic JS token verification
                    driver.Navigate().GoToUrl(url);
                    IJavaScriptExecutor js = (IJavaScriptExecutor)driver;
                    while (true) {
                        try {
                            var condition = js.ExecuteScript("return document.getElementById('novelBody')!=null;");
                            if (driver.FindElements(By.Id("novelBody")).Count != 0 && (bool)condition) break;
                        } catch (Exception ex) {
                            Console.WriteLine(ex.ToString());
                        };
                        Thread.Sleep(100);
                    }
                    var title = js.ExecuteScript("return document.getElementsByClassName('episode-title')[0].innerText;");
                    if (title != null) {
                        str.Append(title.ToString()).Append('\n');
                        AppendTitle(title.ToString(), i);
                    }
                    object? ifs;
                retry:
                    ifs = js.ExecuteScript("return document.getElementById('novelBody').innerText;");
                    if (ifs == null) {
                        Console.WriteLine($"Retry get Chapter-{i}.");
                        Thread.Sleep(1000);
                        goto retry;
                    }
                    string? body = ifs.ToString();
                    if (body == null || body.Length == 0) goto retry;
                    str.Append(body);
                }
            }
            return str;
        }
        static void parse_param(string[] args, int bidx) {
            for (int i = bidx; i < args.Length; ++i) {
                ParamType tmp = param2id[args[i]];
                switch (tmp) {
                    case ParamType.SaveTitleTargetFile:
                        b_sttf = true;
                        ++i;
                        s_sttf = $"{args[bidx - 1]}\\{args[i]}";
                        sttf = new StringBuilder();
                        break;
                    case ParamType.ForceWrite:
                        b_fw = false;
                        break;
                    case ParamType.SaveImmediately:
                        b_fw = false;
                        b_si = true;
                        break;
                    case ParamType.regex_parse:
                        b_reg = true;
                        ++i;
                        s_reg = args[i];
                        break;
                    case ParamType.seq_match:
                        ++i;
                        s_seq = args[i];
                        break;
                    case ParamType.novelpia:
                        s_seq = @"(?<=novel-\d+-)\d+";
                        break;
                }
            }
        }
        static int ExtractNumber(string filename,string? reg) {
            if (reg == null)reg = @"\d+";
            Match match = Regex.Match(filename, reg);
            return match.Success ? int.Parse(match.Value) : 0;
        }
        static async Task Main(string[] args) {
            if (args.Length == 0) {
                Console.WriteLine("https://github.com/KodzukiMio/syosetu-kakuyomu-novelup-alphapolis-novelpia-downloader\nargs:\nbase_url from to to_folder ...\nbase_url file_path to_path ...");
                return;
            }
            if (args[0] == "combine") {
                try {
                    string dir = args[1];
                    string out_file = args[2];
                    parse_param(args, 3);
                    DirectoryInfo root = new DirectoryInfo(dir);
                    FileInfo[] files = root.GetFiles();
                    Console.WriteLine($"Found {files.Length} files.");
                    StringBuilder sb=new StringBuilder();
                    Array.Sort(files, (left, right) => {
                        int left_number = ExtractNumber(left.Name,s_seq);
                        int right_number = ExtractNumber(right.Name,s_seq);
                        return left_number.CompareTo(right_number);
                    });
                    foreach (FileInfo file in files) {
                        if (s_reg != null)if (!Regex.Match(file.Name, s_reg).Success) continue;
                        Console.WriteLine($"Get {file.Name}.");
                        sb.Append(File.ReadAllText(file.FullName));
                    }
                    File.WriteAllText(out_file, sb.ToString());
                    Console.WriteLine("Success.");
                } catch (Exception e){
                    Console.WriteLine (e.ToString());
                    Console.WriteLine("Error regex expression.");
                }
                return;
            }
            string base_url = args[0];
            if (base_url.IndexOf("syosetu.com") != -1) novel_hd = syosetu;
            if (base_url.IndexOf("syosetu.org") != -1) novel_hd = syosetu_org;
            if (base_url.IndexOf("kakuyomu.jp") != -1) novel_hd = kakuyomu;
            if (base_url.IndexOf("alphapolis.co") != -1) novel_hd = alphapolis;
            if (base_url.IndexOf("novelup.plus") != -1) novel_hd = novelup;
            if (novel_hd == null) throw new Exception("Error Type.");
            if (args.Length > 3) {
                if (args[3][0] == '-' || args.Length > 4) {//输出的文件目录开头不要有'-'
                    if (args[3][0] == '-') parse_param(args, 3);
                    else parse_param(args, 4);
                }
            }
            if (args.Length == 3 || (args.Length > 3 && (args[3][0] == '-'))) {
                if (File.Exists(args[1])) {
                    string[] id_list = File.ReadAllText(args[1]).Split(',');
                    if (id_list.Length > 0) {
                        foreach (string id in id_list) {
                        retry:
                            try {
                                int idx = int.Parse(id);
                                string result = (await novel_hd(base_url, idx)).ToString();
                                string file = $"{args[2]}\\Chapter-{idx}.txt";
                                WriteText(ref file, ref result, b_fw);
                                if (b_si) SaveImme();
                            } catch (Exception ex) {
                                //Console.WriteLine(ex.ToString());
                                Console.WriteLine(msg);
                                Thread.Sleep(60000);
                                goto retry;
                            }
                        }
                    }
                } else Console.WriteLine($"File {args[1]} not exist.");
                goto end;
            }
            int to = int.Parse(args[2]);
            if (to == -1) {//Enter -1 to crawl until the last chapter (not supported for Syosetu)
                to_end = true;
                to = int.MaxValue;
            }
            for (int i = int.Parse(args[1]); i <= to; ++i) {
                try {
                    string result = (await novel_hd(base_url, i)).ToString();
                    if (to_end) {
                        to = id_collection.Count;
                        to_end = false;
                    }
                    string file = $"{args[3]}\\Chapter-{i}.txt";
                    WriteText(ref file, ref result, b_fw);
                    if (b_si) SaveImme();
                } catch (Exception e) {
                    //Console.WriteLine(e.ToString());
                    Console.WriteLine(msg);
                    Thread.Sleep(60000);
                    i--;
                    continue;
                }
            }
        end:
            if (driver != null) driver.Quit();
            if (!b_si) SaveImme();
        }
    }
}