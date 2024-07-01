using HtmlAgilityPack;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium;
using System.Text;
using System.Text.RegularExpressions;

namespace syosetu_dl {
    internal class Program {
        public delegate Task<StringBuilder> NovelHandle(string base_url, int i);
        public static NovelHandle? novel_hd = null;
        public static List<string> id_collection = new List<string>();
        public static bool req_main = true;
        public static bool to_end = false;
        public static IWebDriver? driver;
        public static void WriteText(ref string filePath, ref string content, bool ignore_noexist = true) {
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
                doc.LoadHtml(await (await client.GetAsync($"{base_url}/{i}/")).Content.ReadAsStringAsync());
                var pTags = doc.DocumentNode.SelectNodes("//p[starts-with(@id, 'L')]");
                foreach (var p in pTags) str.Append(p.InnerText).Append('\n');
            };
            return str;
        }
        //https://syosetu.org/novel/xxxxx
        public static async Task<StringBuilder> syosetu_org(string base_url, int i) {
            StringBuilder str = new StringBuilder();
            using (HttpClient client = new HttpClient()) {
                client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0");
                client.DefaultRequestHeaders.Add("Cookie", "over18=yes");
                Console.WriteLine($"{base_url}/{i}.html");
                var doc = new HtmlDocument();
                doc.LoadHtml(await (await client.GetAsync($"{base_url}/{i}.html")).Content.ReadAsStringAsync());
                var pTags = doc.DocumentNode.SelectNodes("//p");
                if (pTags != null) {
                    var maegaki = doc.DocumentNode.SelectSingleNode("//div[@id='maegaki']");
                    if (maegaki != null) str.Append(maegaki.InnerText);
                    var span_fs = doc.DocumentNode.SelectSingleNode("//span[@style=\"font-size:120%\"]");
                    if (span_fs != null) str.Append(span_fs.InnerText).Append('\n');
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
                str.Append(doc.DocumentNode.SelectSingleNode("//div[@class='episode_title']").InnerText).Append('\n').Append(doc.DocumentNode.SelectSingleNode("//p[@id='episode_content']").InnerText);
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
        //无法爬取付费文章,需要Firefox浏览器
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
                if (driver != null) {//绕过captcha验证,绕过动态js的token验证
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
                    str.Append(js.ExecuteScript("return document.getElementsByClassName('episode-title')[0].innerText;").ToString()).Append('\n');
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
        static async Task Main(string[] args) {
            if (args.Length == 0) {
                Console.WriteLine("https://github.com/KodzukiMio/syosetu-kakuyomu-novelup-alphapolis-downloader\nargs:base_url from to to_folder");
                return;
            }
            string base_url = args[0];
            if (base_url.IndexOf("syosetu.com") != -1) novel_hd = syosetu;
            if (base_url.IndexOf("syosetu.org") != -1) novel_hd = syosetu_org;
            if (base_url.IndexOf("kakuyomu.jp") != -1) novel_hd = kakuyomu;
            if (base_url.IndexOf("alphapolis.co") != -1) novel_hd = alphapolis;
            if (base_url.IndexOf("novelup.plus") != -1) novel_hd = novelup;
            if (novel_hd == null) throw new Exception("Error Type.");
            if (args.Length == 3) {
                if (File.Exists(args[1])) {
                    string[] id_list = File.ReadAllText(args[1]).Split(',');
                    if (id_list.Length > 0) {
                        foreach (string id in id_list) {
                            try {
                                int idx = int.Parse(id);
                                string result = (await novel_hd(base_url, idx)).ToString();
                                string file = $"{args[2]}\\Chapter-{idx}.txt";
                                WriteText(ref file, ref result, false);
                            } catch (Exception ex) {
                                Console.WriteLine(ex.ToString());
                                goto end;
                            }
                        }
                    }
                } else Console.WriteLine($"File {args[1]} not exist.");
                goto end;
            }
            int to = int.Parse(args[2]);
            if (to == -1) {//to填写-1则是爬取到最后一章(不支持syosetu)
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
                    WriteText(ref file, ref result);
                } catch (Exception e) {
                    Console.WriteLine(e.ToString());
                    Console.WriteLine("Connection timed out or IP request rate limit reached. Automatically waiting for 1 minute before retrying the request.");
                    Thread.Sleep(60000);
                    i--;
                    continue;
                }
            }
        end:
            if (driver != null) driver.Quit();
        }
    }
}