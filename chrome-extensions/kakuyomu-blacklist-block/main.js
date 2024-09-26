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
});
