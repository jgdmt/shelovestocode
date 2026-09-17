async function finishExerciseAPI(branch, mod, ex) {
    const request = new Request(`http://127.0.0.1:8000/finish?branch=${branch}&mod=${mod}&ex=${ex}`, {
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
}

function finishExercise() {
    let local_list = JSON.parse(sessionStorage.getItem('ex-state'));
    const urlParams = new URLSearchParams(window.location.search);
    const branch = urlParams.get('branch') || null;
    const mod = urlParams.get('mod') || null;
    const ex = urlParams.get('ex') || null;
    if (branch == null || mod == null || ex == null) {
        console.log("Error: missing query argument");
    } else {
        if (local_list[ex].status == Status.FINISHED)
            return;
        finishExerciseAPI(branch, mod, ex);
        local_list[ex].status = Status.FINISHED;
    }
    sessionStorage.setItem('ex-state', JSON.stringify(local_list));
}

function sideMenu() {
    let list = document.getElementById("ex-list");
    let ex_list = JSON.parse(sessionStorage.getItem("ex-state"));
    const urlParams = new URLSearchParams(window.location.search);
    const branch = urlParams.get('branch') || null;
    const mod = urlParams.get('mod') || null;
    const ex = urlParams.get('ex') || null;
    if (branch == null || mod == null || ex == null)
        console.log("Error: missing query argument");
    for (let i = 0; i < ex_list.length; i++) {
        let link = document.createElement('a');

        if (i != ex)
            link.href = `${i}.html?branch=${branch}&mod=${mod}&ex=${i}`;
        link.textContent = "Exercise " + i;

        if (i == ex)
            link.classList.add("ex-link-current");
        else if (ex_list[i].status == Status.STARTED)
            link.classList.add("ex-link-started");
        else if (ex_list[i].status == Status.FINISHED)
            link.classList.add("ex-link-done");
        else if (ex_list[i].status == Status.DEFAULT) {
            link.classList.add("ex-link-default")
            link.onclick = () => {
                startExercise(branch, mod, i)
            }
        }
        list.appendChild(link)
    }
}

sideMenu()


function checkQuizExercise() {
    const ans = document.querySelectorAll("select");
    let wrongs = 0;

    ans.forEach(answer => {
        answer.classList.remove("wrong-answer");
        // console.log(answer.options[answer.selectedIndex].textContent)
        if (answer.value == "correct") {
            // answer.classList.add("correct-answer")
            answer.replaceWith(answer.options[answer.selectedIndex].textContent);
            
        } else {
            answer.classList.add("wrong-answer");
            wrongs += 1
        }
    })

    if (wrongs == 0) {
        finishExercise();
        showHiddenObjects();
        const nextBtn = document.getElementById("next-btn");
        const finishBtn = document.getElementById("finish-btn");
        nextBtn.removeAttribute("hidden");
        finishBtn.remove();
    }
}

function checkFillInExercise() {
    const inputs = document.querySelectorAll("input");
    let wrongs = 0;

    inputs.forEach(input => {
        input.classList.remove("wrong-answer")
        if (input.id == input.value) {
            input.replaceWith(input.id);
        } else {
            input.classList.add("wrong-answer")
            wrongs += 1;
        }
    })

    if (wrongs == 0) {
        finishExercise();
        showHiddenObjects();
        const nextBtn = document.getElementById("next-btn");
        const finishBtn = document.getElementById("finish-btn");
        nextBtn.removeAttribute("hidden");
        finishBtn.remove();
    }
}

function showHiddenObjects() {
    const objects = document.getElementsByName("hidden-result");

    objects.forEach(obj => {
        obj.hidden = false;
    })
}
