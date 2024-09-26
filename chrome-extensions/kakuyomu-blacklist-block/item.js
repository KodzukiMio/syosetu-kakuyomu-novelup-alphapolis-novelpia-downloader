var __kkym__plugins__ = __kkym__plugins__ || {};
__kkym__plugins__.ok = function (htm) {
    const doc = (new DOMParser()).parseFromString(htm, 'text/html').querySelectorAll('ul span#blockedUsers-activityName');
    let data = [];
    for (let i = 0; i < doc.length; i++)data.push(doc[i].outerText);
    __kkym__plugins__.set(data);
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
__kkym__plugins__.run = async function () {
    let data = await __kkym__plugins__.get();
    if (!data) try {
        const response = await fetch('https://kakuyomu.jp/settings/blocklist', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const result = await response.text();
        data = __kkym__plugins__.ok(result);
    } catch (error) {
        console.error('There has been a problem with fetch:', error);
    }
    this.handle(data, await this.get('gld_kkym_col'));
}
__kkym__plugins__.handle = function (data, type) {
    type = type ? type : 'ignore';
    const umap = new Map();
    data.forEach(str => umap.set(str, true));
    let nodes = document.querySelectorAll('a[href^="/users/"]');
    nodes.forEach(link => {
        try {
            if (umap.has(link.innerText)) {
                let pnode = link.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
                if (type == 'ignore') pnode.remove();
                else pnode.style.color = "red";
            }
        } catch (e) { }
    });
    console.log(`blocked :${data}\nblock type:${type}`);
}
__kkym__plugins__.run();