(async function () {
    class Store {
        constructor(namespace, separator = ':') {
            if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local || !namespace || typeof namespace !== 'string' || namespace.trim() === '') throw new Error('Invalid namespace');
            this.namespace = namespace;
            this.separator = separator;
        }
        _prefixKey(key) {
            return `${this.namespace}${this.separator}${key}`;
        }
        async get(key) {
            const namespacedKey = this._prefixKey(key);
            return new Promise((resolve, reject) => {
                chrome.storage.local.get([namespacedKey], (result) => {
                    if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                    resolve(result[namespacedKey]);
                });
            });
        }
        async set(key, value) {
            const namespacedKey = this._prefixKey(key);
            const data = {};
            data[namespacedKey] = value;
            return new Promise((resolve, reject) => {
                chrome.storage.local.set(data, () => {
                    if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                    resolve();
                });
            });
        }
        async remove(keyOrKeys) {
            const keysToRemove = Array.isArray(keyOrKeys) ? keyOrKeys.map(k => this._prefixKey(k)) : this._prefixKey(keyOrKeys);
            return new Promise((resolve, reject) => {
                chrome.storage.local.remove(keysToRemove, () => {
                    if (chrome.runtime.lastError)
                        return reject(chrome.runtime.lastError);
                    resolve();
                });
            });
        }
        async clear() {
            return new Promise((resolve, reject) => {
                chrome.storage.local.get(null, (allItems) => {
                    if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                    const keysInNamespace = Object.keys(allItems).filter(fullKey => fullKey.startsWith(this.namespace + this.separator));
                    if (keysInNamespace.length > 0) {
                        chrome.storage.local.remove(keysInNamespace, () => {
                            if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                });
            });
        }
    }
    const handle = {
        store: new Store("syosetu.org"),
        sleep: async function (delay) {
            return new Promise((resolve) => setTimeout(resolve, delay));
        },
        async setup(mode) {
            await this.init();
            if (mode) await this.menu();
            else await this.novel();
        },
        getText() {
            try {
                const match = [];
                document.querySelectorAll('span').forEach(span => {
                    if (span.style.fontSize === '120%') match.push(span);
                });
                let _title = match[1].innerText;
                let text_main = document.getElementById("honbun").innerText;
                let text_sub = document.getElementById("atogaki").innerText;
                return {
                    title: _title ? _title : "",
                    main: text_main ? text_main : "",
                    sub: text_sub ? text_sub : ""
                };
            } catch (e) {
                console.log(e);
            }
            return null;
        },
        combine(text_obj) {
            return text_obj.title + "\n" + text_obj.main + "\n" + text_obj.sub;
        },
        getContent() {
            const text_obj = this.getText();
            return text_obj ? this.combine(text_obj) : "";
        },
        save_file(content, fileName, mimeType = 'text/plain') {
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
        },
        savePage(fileName) {
            const content = this.getContent();
            if (content) {
                this.save_file(content, fileName);
            } else {
                console.error("No content to save.");
            }
        },
        async setState(obj) {
            await this.store.set("last_state", obj);
        },
        async getState() {
            let ret = await this.store.get("last_state");
            return ret ? ret : {};
        },
        async removeState() {
            await this.store.remove("last_state");
        },
        async setData(obj) {
            await this.store.set("last_data", obj);
        },
        async getData() {
            let ret = await this.store.get("last_data");
            return ret ? ret : {};
        },
        async removeData() {
            await this.store.remove("last_data");
        },
        async removeAll() {
            await this.store.clear();
        },
        async resetAll() {
            await this.removeState();
            await this.removeData();
        },
        last_state: {
            cur: 0,//当前页面
        },
        getPage() {
            let page = window.location.href.split("/");
            let page_name = page[page.length - 2];
            return parseInt(page_name);
        },
        getNumber() {
            let page = window.location.href.split("/");
            let page_name = page[page.length - 1];
            return parseInt(page_name);
        },
        async update() {
            if (this.getNumber() != this.last_state.cur) {
                window.location.href = `https://syosetu.org/novel/${this.getPage()}/${this.last_state.cur}.html`;
                return;
            }
            this.savePage(`Chapter-${this.last_state.cur}.txt`);
            this.last_state.cur++;
            if (this.last_state.cur > this.last_data.last || this.last_data.last == 0) {
                await this.resetAll();
                return;
            }
            await this.setState(this.last_state);
            next_url = `https://syosetu.org/novel/${this.getPage()}/${this.last_state.cur}.html`;
            window.location.href = next_url;
        },
        last_data: {
            first: 0,//起始页
            last: 0//结束页
        },
        need_download: false,
        async init() {
            this.last_state = await this.getState();
            this.last_data = await this.getData();
            if (this.last_state.cur == undefined) {
                this.last_state.cur = 0;
                this.setState(this.last_state);
            }
            if (this.last_data.first == undefined) {
                this.last_data.first = 0;
                this.last_data.last = 0;
                this.setData(this.last_data);
            }
            if (this.last_state.cur > 0 || this.last_data.first > 0) this.need_download = true;
            console.log(this.last_data);
            console.log(this.last_state);
        },
        async menu() {//menu

        },
        async novel() {//viewer
            if (this.last_data.last == 0) return;
            if (this.need_download) {
                await this.update();
            }
        }
    }
    const is_menu = window.location.href.indexOf("main.html") != -1;
    const is_viewer = !is_menu && document.location.href.indexOf("html") != -1;
    const is_novel = document.location.href.indexOf("html") == -1;
    async function download() {
        let data = prompt("Please enter the page range you want to download-> [Begin]-[End]", "1-2");
        if (!data) return;
        let data_arr = data.split("-");
        if (data_arr.length != 2) {
            alert("Invalid input format. Please enter in the format [Begin]-[End]");
            return;
        }
        try {
            let begin = parseInt(data_arr[0]);
            let end = parseInt(data_arr[1]);
            if (isNaN(begin) || isNaN(end) || begin < 1 || end < 1 || begin > end) {
                alert("Invalid input. Please enter valid page numbers.");
                return;
            }
            await handle.setData({
                first: begin,
                last: end
            });
            handle.last_state.cur = begin;
            handle.setState(handle.last_state);
        } catch (e) {
            alert("Invalid input. Please enter valid page numbers.");
            return;
        }
    };
    document.addEventListener('DOMContentLoaded', () => {
        if (is_menu) {
            document.getElementById('download').addEventListener('click', async () => {
                await download();
            });
            handle.setup(true);
        };
    });
    if (is_viewer) {
        setTimeout(() => {
            handle.setup(false);
        }, 1000);//等待1s
    }
    if (is_novel) {
        setInterval(async () => {
            let data = await handle.getData();
            if (data.first > 0) {
                window.location.href = window.location.href + `${data.first}.html`;
            }
        }, 1000);
    }
})();
