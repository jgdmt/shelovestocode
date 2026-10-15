const Status = {
    DEFAULT: 0,
    STARTED: 1,
    FINISHED: 2
}

async function startExercise(branch, mod, ex) {
    let ex_list = JSON.parse(sessionStorage.getItem('ex-state'))
    if (ex_list[ex].status != Status.DEFAULT) {
        console.log('return')
        return;
    }
    const request = new Request(`http://127.0.0.1:8000/start?branch=${branch}&mod=${mod}&ex=${ex}`, {
        method: "POST"
    });
    fetch(request)
    .then((response) => {
        if (response.status !== 200) {
            console.log("ERROR", response.status);
        }
        else {
            console.log("Success");
        }
    })
    ex_list[ex].status = Status.STARTED
    sessionStorage.setItem('ex-state', JSON.stringify(ex_list))
}

async function saveFile(name, content) {
    const request = new Request(`http://127.0.0.1:8000/web/save`, {
        method: "POST",
        body: JSON.stringify({
            name: name,
            content: content
        }),
        headers: {
            "Content-Type": "application/json"
        }
    });
    fetch(request)
    .then((response) => {
        if (response.status !== 200) {
            console.log("ERROR", response.status);
        }
        else {
            console.log("Success", response.body);
        }
    })
}

async function getFile(name) {
    const resp = await fetch(`http://127.0.0.1:8000/web/get?name=${name}`);
    const body = await resp.json();
    console.log(body);
}

function nextButtonSetup() {
    let ex_list = JSON.parse(sessionStorage.getItem('ex-state'));
    const urlParams = new URLSearchParams(window.location.search);

    const nextBtn = document.getElementById('next-btn-link');
    if (nextBtn == null) {
        return;
    }
    
    const branch = urlParams.get('branch') || null;
    const mod = urlParams.get('mod') || null;
    const ex = urlParams.get('ex') || null;
    let ex_int = parseInt(ex) + 1
    if (branch == null || mod == null || ex == null) {
        console.log("Error: missing query argument");
        return;
    } else {
        nextBtn.href = `${ex_int}.html?branch=${branch}&mod=${mod}&ex=${ex_int}`;
    }
}

function translate(lan, mod, ex) {

}

function openInventory() {
    console.log("Clicked")
    document.getElementById("diary").style.width = "50%";
}

function closeInventory() {
    console.log("Closed")
    document.getElementById("diary").style.width = "0";
}

function manageInventory(id) {
    let items = document.getElementById("inventory-items");
    let list = document.getElementById("inventory-list");

    if (items == null || list == null) {
        return;
    }

    items.hidden = true;
    list.hidden = true;
    switch (id) {
        case "inventory-items":
            items.hidden = false;
            break;
        case "inventory-list":
            list.hidden = false;
    }
}

nextButtonSetup()
translate()