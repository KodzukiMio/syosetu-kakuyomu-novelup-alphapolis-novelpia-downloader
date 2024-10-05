var __novelpia_dl = __novelpia_dl || {};
__novelpia_dl.save_file = function (content, fileName, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}
__novelpia_dl.decode = function (str) {
    return str.replace(/&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-f]{1,6});/ig, function (match, p1) {
        if (p1.charAt(0) === '#') {
            return String.fromCharCode(p1.charAt(1) === 'x' ? parseInt(p1.substring(2), 16) : parseInt(p1.substring(1), 10));
        } else {
            var entities = { amp: '&', apos: "'", quot: '"', lt: '<', gt: '>', nbsp: '\u00A0' };
            return entities[p1] || match;
        }
    });
};
__novelpia_dl.getfrom_url = async function (url) {
    const rep = (await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    }));
    if (!rep.ok) throw new Error('Network response was not ok');
    return await rep.text();
}
__novelpia_dl.set_page = function (nid, page, callback) {//page -> 0
    localStorage[`novel_page_${nid}`] = page.toString();
    const data = new URLSearchParams();
    data.append("novel_no", nid.toString());
    data.append("sort", localStorage[`novel_sort_${nid}`]);
    data.append("page", localStorage[`novel_page_${nid}`]);
    fetch("/proc/episode_list", {
        method: "POST",
        body: data,
        cache: "no-cache"
    }).then(response => response.text()).then(data => {
        document.getElementById('episode_list').innerHTML = data;
        callback();
    });
}
__novelpia_dl.global_id = 1;
__novelpia_dl.collection = null;
__novelpia_dl.collect = function (filename, page, nid, base_url) {
    this.set_page(nid, page, async () => {
        try {
            const nodes = document.querySelectorAll('[id^="bookmark_"]');
            let bflag = true;
            let promises = Array.from(nodes).reduce((promiseChain, node) => {
                return promiseChain.then(async () => {
                    if (this.collection.has(node.id)) return (bflag = false);
                    let url = base_url + node.id.substring(9);
                    const data = JSON.parse(await this.getfrom_url(url)).s;
                    let str = "";
                    for (let idx = 0; idx < data.length; idx++) str += data[idx].text;
                    this.save_file(this.decode(str.replace(/<[^>]+>/g, '')), `${filename}-${this.global_id++}`);
                    this.collection.set(node.id, true);
                });
            }, Promise.resolve());
            promises.then(() => {
                if (nodes.length > 0 && bflag) this.collect(filename, page + 1, nid, base_url);
            }).catch(() => console.log("Download finish."));
        } catch (e) {
            console.error(e);
        };
    });
}
__novelpia_dl.handle = async function () {
    let type = null;
    if (window.location.href.indexOf("/novel/") != -1) type = __novelpia_dl.NOVEL;
    else type = __novelpia_dl.VIEWER;
    let url = window.location.href;
    if (url != window.location.href) return;
    if (type == __novelpia_dl.VIEWER) __novelpia_dl.save_file(this.decode(document.getElementById("novel_drawing").innerText.replace(/<[^>]+>/g, '')), `${url.replace(/[^0-9\s]/g, '')}.txt`);
    else if (type == __novelpia_dl.NOVEL) {
        let filename = `novel-${url.match(/\d+/)?.[0]}`;
        this.global_id = 1;
        this.collection = new Map();
        this.collect(filename, 0, window.location.href.match(/\d+/)?.[0], window.location.href.substring(0, window.location.href.lastIndexOf('/', 20) + 1) + 'proc/viewer_data/');
    } else window.console.log("no choice");
};
__novelpia_dl.sleep = async function (delay) {
    return new Promise((resolve) => setTimeout(resolve, delay));
}
__novelpia_dl.listener = async function (key, value, callback) {//value != null
    try {
        while (true) {
            if ((await this.get(key)) == value) {
                callback();
                this.set(key, null);
            }
            await this.sleep(100);
        }
    } catch (e) { }
};
__novelpia_dl.set_ok = function (key) {
    this.set(key, __novelpia_dl.OK);
}
__novelpia_dl.set_listener = async function (key, callback) {
    this.listener(key, __novelpia_dl.OK, callback);
}
__novelpia_dl.VIEWER = 0xfff0;
__novelpia_dl.NOVEL = 0xfff1;
__novelpia_dl.OK = 0xfff2;
__novelpia_dl.STATE = "novelpia_listen";
__novelpia_dl.set = function (key, value, callback = () => { }) {
    let data = {};
    data[key] = value;
    chrome.storage.local.set(data, callback);
};
__novelpia_dl.get = function (key) {
    return new Promise((resolve, reject) => chrome.storage.local.get([key], result => resolve(result[key])));
};