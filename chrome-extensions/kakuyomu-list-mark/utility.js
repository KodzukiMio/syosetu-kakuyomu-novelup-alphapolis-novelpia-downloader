class BlockManager {
    static BM_KEY = "gld_kkym_bm";
    constructor() {
        this.data = null;
        this.is_init = false;
    };
    async get_data() {
        const data = await (function (key) {
            return new Promise((resolve, reject) => chrome.storage.local.get([key], result => resolve(result[key])));
        })(BlockManager.BM_KEY);
        return data ? new Map(Object.entries(data)) : null;
    }
    async sleep(delay) {
        return new Promise((resolve) => setTimeout(resolve, delay));
    }
    set_data(data) {
        const dataToStore = data ? Object.fromEntries(data) : null;
        return new Promise((resolve) => {
            chrome.storage.local.set({ [BlockManager.BM_KEY]: dataToStore }, resolve);
        });
    }
    async init_data() {
        if (this.is_init) return;
        if (!(this.data = await this.get_data())) {
            this.data = new Map();
            await this.save();
        }
        console.log(this.data);
        this.is_init = true;
    }
    get_name() {
        return document.querySelectorAll('a[href^="/users/"]')[1].textContent;
    }
    add(name,url) {
        this.data.set(name, url);
    }
    del(name) {
        this.data.delete(name);
    }
    async check(name) {
        return this.data.has(name);
    }
    has(name){
        return this.data.has(name);
    }
    reload() {
        this.is_init = false;
        this.init_data();
    }
    clear() {
        this.set_data(null);
    }
    async save() {
        await this.set_data(this.data);
    }
}
const bkmanager = new BlockManager();