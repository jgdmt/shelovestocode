async function loadExercises() {
    const resp = await fetch("http://127.0.0.1:8000/info?branch=web");
    const exs = await resp.json();
    console.log(exs)
    let list = document.getElementById("exercise-list");
    let ex = exs["branch_status"]
    for (let i = 0; i < ex.length; i++) {
        let elem = document.createElement("li");
        let link = document.createElement("a");
        link.href = `html/module_${exs["module"]}/${i}.html?branch=${exs["branch"]}&mod=${exs["module"]}&ex=${i}`;
        link.textContent = "Exercise " + i;
        if (ex[i].status == Status.FINISHED)
            link.classList.add("ex-link-done");
        else if (ex[i].status == Status.STARTED)
            link.classList.add("ex-link-started");
        else
            link.classList.add("ex-link-default")
        link.onclick = () => {
            startExercise(exs["branch"], exs["module"], i)
        }
        elem.appendChild(link);
        list.appendChild(elem);
    }
    sessionStorage.setItem("ex-state", JSON.stringify(ex));
}

loadExercises()
