var __kkym__plugins__ = __kkym__plugins__ || {};
__kkym__plugins__.set_mark = function (data) {
    chrome.storage.local.set({ gld_kkym_mark: data }, function () { });
};
__kkym__plugins__.get = function (key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], function (result) {
            resolve(result[key]);
        });
    });
};
__kkym__plugins__.mark_update = function (data) {
    let vis = new Map();
    data.forEach(node => {
        let instr = node.innerText;
        vis[instr.substring(0, instr.lastIndexOf('@') - 1)] = node.__kkym_type;
    });
    this.set_mark(vis);
}
__kkym__plugins__.mark = async function () {
    let nodes = document.querySelectorAll('a[href^="/users/"]');
    const data = [];
    for (let idx = 2; idx < nodes.length; idx++) {
        let str = nodes[idx].innerText;
        let idf = str.lastIndexOf('@');
        if (idf != -1) data.push(nodes[idx]);
    }
    let vis = await this.get("gld_kkym_mark");
    data.forEach(node => {
        let button = document.createElement('button');
        button.textContent = "visiable";
        if (vis) {
            let type = vis[node.innerText.substring(0, node.innerText.lastIndexOf('@') - 1)];
            node.__kkym_type = type ? type : "green";
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
            } else {
                node.__kkym_type = 'green';
                button.style.color = "rgb(0,255,0)";
            }
            __kkym__plugins__.mark_update(data);
        });
        node.parentNode.append(button);
    });
    this.mark_update(data);
};
__kkym__plugins__.mark();
