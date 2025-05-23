var __kkym__plugins__ = __kkym__plugins__ || {};
__kkym__plugins__.ok = function (htm) {
    const doc = (new DOMParser()).parseFromString(htm, 'text/html').querySelectorAll('ul span#blockedUsers-activityName');
    let data = [];
    for (let i = 0; i < doc.length; i++)data.push(doc[i].outerText);
    this.set(data);
    return data;
}
__kkym__plugins__.set = function (data) {
    chrome.storage.local.set({ gld_kkym: data }, function () { });
};
__kkym__plugins__.get = function (key = 'gld_kkym') {
    return new Promise((resolve, reject) => chrome.storage.local.get([key], result => resolve(result[key])));
}
__kkym__plugins__.update = async function () {
    try {
        return this.ok(await this.getfrom_url('https://kakuyomu.jp/settings/blocklist'));
    } catch (error) {
        console.error('There has been a problem with fetch:', error);
    }
}
__kkym__plugins__.run = async function () {
    await bkmanager.init_data();
    this.test();
    let data = await this.get();
    if (!data) data = await this.update();
    else this.update();
    this.handle(data, await this.get('gld_kkym_col'));
    this.refresh();
}
__kkym__plugins__.getfrom_url = async function (url) {
    const rep = (await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    }));
    if (!rep.ok) throw new Error('Network response was not ok');
    return await rep.text();
}
__kkym__plugins__.settype = function (umap, nodes, type, filter = null) {
    nodes.forEach(link => {
        try {
            let bk = bkmanager.has(link.textContent);
            if (umap.has(link.textContent) || bk) {//must use textContent,not innerText;
                let is_tag = false;
                let pnode = link.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
                if (window.location.href.indexOf("/tags/") != -1) {
                    pnode = link.parentElement.parentElement.parentElement.parentElement;
                    is_tag = true;
                }
                let col = bk ? "red" : "rgb(0,255,0)";
                if (filter) {
                    if (filter.has(link.textContent)) pnode.remove();//backgroundColor
                    else {
                        if (is_tag) pnode.style.backgroundColor = col;
                        else pnode.style.color = col;
                    }
                } else {
                    if (type == 'ignore') pnode.remove();
                    else {
                        if (is_tag) pnode.style.backgroundColor = col;
                        else pnode.style.color = bk ? "red" : type;
                    }
                }
            }
        } catch (e) { }
    });
}
__kkym__plugins__.handle = function (data, type) {
    type = type ? type : 'ignore';
    const umap = new Map();
    data.forEach(str => umap.set(str, true));
    let nodes = document.querySelectorAll('a[href^="/users/"]');
    this.settype(umap, nodes, type, null);
    if (data.length) console.log(`blocked :${data}\nblock type :${type}`);
}
__kkym__plugins__.get_map = function (key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], function (result) {
            resolve(new Map(Object.entries(result[key] || {})));
        });
    });
};
__kkym__plugins__.refresh = async function (data, show = true) {
    if (!data) {
        data = await this.get("gld_kkym_usr");
        if (!data) data = await this.test();
    }
    if (show && data.length) console.log(`mark :${data}`);
    let type = await this.get("gld_kkym_fcol");
    type = type ? type : 'rgb(0,255,0)';
    let nodes = document.querySelectorAll('a[href^="/users/"]');
    const umap = new Map();
    data.forEach(str => umap.set(str, true));
    let filter = await this.get_map("gld_kkym_mark");
    if (show) console.log("filter :", filter);
    this.settype(umap, nodes, type, filter);
}
__kkym__plugins__.test = async function () {
    const base_url = `https://kakuyomu.jp/users/${(new DOMParser()).parseFromString(await this.getfrom_url('https://kakuyomu.jp/settings/others'), 'text/html').querySelectorAll('a[href^="/users/"]')[0].textContent.substring(1)}/following_users?page=`;
    //const base_url ="https://kakuyomu.jp/users/*/following_users?page="
    const datas = [];
    let idx = 1;
    while (true) {
        const url = base_url + idx++;
        const html_text = await this.getfrom_url(url);
        if (html_text.indexOf("フォローしてません") != -1) break;
        const data = (new DOMParser()).parseFromString(html_text, 'text/html').querySelectorAll('a[href^="/users/"]');
        for (let idx = 2; idx < data.length; idx++) {
            let str = data[idx].textContent;
            let idf = str.lastIndexOf('@');
            if (idf != -1) datas.push(str.substring(0, idf));
        }
        //console.log(`debug add from page ${idx - 1} -> ${datas}`);
    }
    chrome.storage.local.set({ gld_kkym_usr: datas }, () => this.refresh(datas, false));
    return datas;
}
__kkym__plugins__.run();