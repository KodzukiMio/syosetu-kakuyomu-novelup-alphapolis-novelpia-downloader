function set_option(value) {
    chrome.storage.local.set({ gld_kkym_col: value }, function () { });
    location.reload();
};
function set_option_f(value) {
    chrome.storage.local.set({ gld_kkym_fcol: value }, function () { });
    location.reload();
};
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('black_red').addEventListener('click', function () {
        set_option('red');
    });
    document.getElementById('black_ignore').addEventListener('click', function () {
        set_option('ignore');
    });
    document.getElementById('clear_storage').addEventListener('click', function () {
        chrome.storage.local.clear(function () {
            console.log("local storage cleared");
        });
    });
    // document.getElementById('follow_green').addEventListener('click', function () {
    //     set_option_f('rgb(0,255,0)');
    // });
    // document.getElementById('follow_ignore').addEventListener('click', function () {
    //     set_option_f('ignore');
    // });
});
