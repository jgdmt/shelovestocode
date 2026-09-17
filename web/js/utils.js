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

function openDiary() {
    console.log("Clicked")
    document.getElementById("diary").style.width = "50%";

    fetch("../../diary/0.txt")
    .then((res) => res.text())
    .then((text) => 
        console.log(text))
    .catch((e) => console.log(e));
    // let abc = new Blob(["HELLOOOO"], {type: "text/plain"});
    // let def = new FileReader();
    // def.addEventListener("loadend", function(e) {
    //     document.getElementById("diary-entry").innerHTML = e.srcElement.result;
    // });

    // let test = File()

    // def.readAsText(abc)
}

function closeDiary() {
    console.log("Closed")
    document.getElementById("diary").style.width = "0";
}

nextButtonSetup()