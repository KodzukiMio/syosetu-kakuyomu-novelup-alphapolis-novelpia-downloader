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
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], function (result) {
            resolve(result[key]);
        });
    });
}
__kkym__plugins__.update = async function () {
    try {
        this.ok(await this.getfrom_url('https://kakuyomu.jp/settings/blocklist'));
    } catch (error) {
        console.error('There has been a problem with fetch:', error);
    }
}
__kkym__plugins__.run = async function () {
    this.test();
    let data = await this.get();
    if (!data) await this.update();
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
            if (umap.has(link.innerText)) {
                let pnode = link.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
                if (filter) {
                    if (filter[link.innerText] == "ignore") pnode.remove();
                    else pnode.style.color = "rgb(0,255,0)";
                } else {
                    if (type == 'ignore') pnode.remove();
                    else pnode.style.color = type;
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
    if (data.length) console.log(`blocked :${data}\nblock type:${type}`);
}
__kkym__plugins__.refresh = async function (data, show = true) {
    if (!data) {
        data = await this.get("gld_kkym_usr");
        if (!data) await this.test();
    }
    if (show && data.length) console.log(`mark :${data}`);
    let type = await this.get("gld_kkym_fcol");
    type = type ? type : 'rgb(0,255,0)';
    let nodes = document.querySelectorAll('a[href^="/users/"]');
    const umap = new Map();
    data.forEach(str => umap.set(str, true));
    let filter = await this.get("gld_kkym_mark");
    if (show) console.log("filter :", filter);
    this.settype(umap, nodes, type, filter);
}
__kkym__plugins__.test = async function () {
    const url = `https://kakuyomu.jp/users/${(new DOMParser()).parseFromString(await this.getfrom_url('https://kakuyomu.jp/settings/others'), 'text/html').querySelectorAll('a[href^="/users/"]')[0].innerText.substring(1)}/following_users`;
    const data = (new DOMParser()).parseFromString(await this.getfrom_url(url), 'text/html').querySelectorAll('a[href^="/users/"]');
    const datas = [];
    for (let idx = 2; idx < data.length; idx++) {
        let str = data[idx].innerText;
        let idf = str.lastIndexOf('@');
        if (idf != -1) datas.push(str.substring(0, idf));
    }
    chrome.storage.local.set({ gld_kkym_usr: datas }, () => this.refresh(datas, false));
}
__kkym__plugins__.run();