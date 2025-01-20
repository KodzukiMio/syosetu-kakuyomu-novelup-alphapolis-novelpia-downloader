(async () => {
    function changeType(button, tag) {
        if (tag == "UnBlock") {
            button.textContent = "Block";
            button.style.color = "red";
        } else {
            button.textContent = "UnBlock";
            button.style.color = "green";
        }
        return (button.style.color == "green");
    }
    var __kkym__plugins__ = __kkym__plugins__ || {};
    __kkym__plugins__.next_mark = async function () {
        if (window.location.href.indexOf("settings/blocklist") != -1) {
            await bkmanager.init_data();
            let bklist = document.getElementById("container-inner").children[2];
            bkmanager.data.forEach((value, key) => {
                let item = document.createElement("li");
                item.innerHTML = `<a href="${value}"><div><span id="blockedUsers-activityName" style="color:red">${key}</span></div></a>`;
                bklist.appendChild(item);
            });
            return;
        }
        let bt = document.getElementById("app").children[0].children[0];
        let button = document.createElement("button");
        const name = bkmanager.get_name();
        await bkmanager.init_data();
        changeType(button, await bkmanager.check(name) ? "UnBlock" : "Block");
        button.style.backgroundColor = "white";
        button.onclick = () => this.handle(button, name);
        bt.appendChild(button);
    }
    __kkym__plugins__.handle = async function (bt, name) {
        if (changeType(bt, bt.textContent)) {//unblock
            bkmanager.del(name);
        } else {//block
            bkmanager.add(name, window.location.href);
        };
        await bkmanager.save();
        alert("update successfully");
    }
    __kkym__plugins__.next_mark();
})();