function set_option(value) {
    chrome.storage.local.set({ gld_kkym_col: value }, function () { });
    location.reload();
};
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('set_red').addEventListener('click', function () {
        set_option('red');
    });
    document.getElementById('set_ignore').addEventListener('click', function () {
        set_option('ignore');
    });
    document.getElementById('refresh').addEventListener('click', function () {
        try {
            const response = fetch('https://kakuyomu.jp/settings/blocklist', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const result = response.text();
            const doc = (new DOMParser()).parseFromString(htm, 'text/html').querySelectorAll('ul span#blockedUsers-activityName');
            let data = [];
            for (let i = 0; i < doc.length; i++)data.push(doc[i].outerText);
            chrome.storage.local.set({ gld_kkym: data }, function () { });
        } catch (error) {
            console.error('There has been a problem with fetch:', error);
        }
    });
});
