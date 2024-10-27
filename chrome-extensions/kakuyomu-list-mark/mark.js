var __kkym__plugins__ = __kkym__plugins__ || {};
__kkym__plugins__.set_mark = function (data) {
    const obj = Object.fromEntries(data);
    chrome.storage.local.set({ gld_kkym_mark: obj }, function () { });
};
__kkym__plugins__.get = function (key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], function (result) {
            resolve(new Map(Object.entries(result[key] || {})));
        });
    });
};
__kkym__plugins__.mark_update = async function (data, to_del = null) {
    let vis = (await this.get("gld_kkym_mark")) || new Map();
    if (!(vis instanceof Map)) vis = new Map();
    data.forEach(node => {
        if (node.textContent == to_del) vis.delete(to_del.substring(0, to_del.lastIndexOf('@') - 1));
        if (node.__kkym_type == "ignore") {
            let instr = node.textContent;
            vis.set(instr.substring(0, instr.lastIndexOf('@') - 1), true);
        }
    });
    this.set_mark(vis);
}
__kkym__plugins__.get_id = function () {
    const url = window.location.href;
    const match = url.match(/page=(\d+)/);
    if (match) return match[1].toString();
    return '1';
}
__kkym__plugins__.mark = async function () {
    let nodes = document.querySelectorAll('a[href^="/users/"]');
    const data = [];
    for (let idx = 2; idx < nodes.length; idx++) {
        let str = nodes[idx].textContent;
        let idf = str.lastIndexOf('@');
        if (idf != -1) data.push(nodes[idx]);
    }
    let vis = await this.get("gld_kkym_mark") || new Map();
    try {
        vis.get(1);
    } catch {
        vis = new Map();
        this.set_mark(vis);
    }
    data.forEach(node => {
        let button = document.createElement('button');
        button.textContent = "visiable";
        if (vis) {
            let type = vis.get(node.textContent.substring(0, node.textContent.lastIndexOf('@') - 1));
            node.__kkym_type = type ? type : "green";
            if (node.__kkym_type == true) node.__kkym_type = "ignore";
            if (node.__kkym_type == "green") button.style.color = "rgb(0,255,0)";
            else button.style.color = "rgb(255,0,0)";
        } else {
            node.__kkym_type = "green";
            button.style.color = "rgb(0,255,0)";
        }
        button.addEventListener('click', () => {
            if (node.__kkym_type === 'green') {
                node.__kkym_type = "ignore";
                button.style.color = "rgb(255,0,0)";
                this.mark_update(data);
            } else {
                node.__kkym_type = 'green';
                button.style.color = "rgb(0,255,0)";
                this.mark_update(data, node.textContent);
            }
        });
        node.parentNode.append(button);
    });
};
__kkym__plugins__.mark();
