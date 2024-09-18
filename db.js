import { child, database, get, ref, set } from "./firebaseSDK.js";
import { showToast } from "./toast.js";

let userValidated = false;
const dbref = ref(database);

function toggleCheckbox(rele) {
    if (!userValidated) {
        return;
    }
    return function () {
        const data = {
            "status": this.checked ? 1 : 0
        };
        set(child(dbref, `data/slc/reles/${rele}/`), data).then(() => {
            console.log("Data inserted successfully");
        }).catch((error) => {
            console.error(error);
        });
    };
}

async function getAvailableReles() {
    if (!userValidated) {
        return;
    }
    await get(child(dbref, 'data/slc/')).then((snapshot) => {
        if (snapshot.exists()) {
            const reles = snapshot.val().reles;
            let atLeastOneReleTrue = false;

            for (const rele in reles) {
                const releStatus = reles[rele].status;
                const div = document.createElement("div");
                div.classList.add("rele");
                const h4 = document.createElement("h4");
                let title = "";
                const label = document.createElement("label");
                label.classList.add("switch");
                const span = document.createElement("span");

                switch (rele) {
                    case "0":
                        title = "Horta";
                        break;
                    case "4":
                        title = "Caixa d'água casa";
                        break;
                    case "16":
                        title = "Caixa d'água chiqueiro";
                        break;
                    case "17":
                        title = "Bomba d'água";
                        label.classList.add("disabled");
                        break;
                    default:
                        title = "Sem uso";
                        label.classList.add("disabled");
                        break;
                }
                h4.textContent = `${title} - GPIO ${rele}`;
                const input = document.createElement("input");
                input.type = "checkbox";
                input.onchange = toggleCheckbox(rele);
                input.id = rele;

                if (releStatus) {
                    input.checked = true;
                }
                if (rele == "17") {
                    input.disabled = true;
                }
                // if (rele == "4" && !atLeastOneReleTrue) {
                //     input.checked = true;
                // }
                span.classList.add("slider");
                label.appendChild(input);
                label.appendChild(span);
                div.appendChild(h4);
                div.appendChild(label);
                document.querySelector(".rele_list").appendChild(div);

            }
        } else {
            console.log("Reles not found, inserting all reles");
            insertAllReles();
        }

    }).catch((error) => {
        console.error(error);
    });
}

function insertAllReles() {
    const data = {
        "reles": {
            "0": {
                "status": 0
            },
            "4": {
                "status": 0
            },
            "16": {
                "status": 0
            },
            "17": {
                "status": 0
            },
        }
    };
    if (!userValidated) {
        return;
    }
    set(child(dbref, 'data/slc/'), data).then(() => {
        console.log("Data inserted successfully");
        window.location.reload();
    }).catch((error) => {
        console.error(error);
    });
}

function checkStatusRele() {
    if (!userValidated) {
        return;
    }
    get(child(dbref, 'data/slc/')).then((snapshot) => {
        if (snapshot.exists()) {
            const reles = snapshot.val().reles;
            for (const rele in reles) {
                const releStatus = reles[rele].status;
                const input = document.getElementById(rele);
                if (releStatus) {
                    input.checked = true;
                } else {
                    input.checked = false;
                }
            }

            // if (!atLeastOneReleTrue) {
            //     // If no rele is on, turn on the GPIO 4
            //     const input = document.getElementById("4");
            //     input.checked = true;
            //     setReleStatus(input.id, 1);
            // }
        }
    }).catch((error) => {
        console.error(error);
    });
}

function getReleStatus(rele) {
    if (!userValidated) {
        return;
    }
    // Return a new promise
    return new Promise((resolve, reject) => {
        get(child(dbref, `data/slc/reles/${rele}/`)).then((snapshot) => {
            if (snapshot.exists()) {
                // Resolve the promise with the status
                resolve(snapshot.val().status);
            } else {
                // Resolve with null or reject based on your use case if the snapshot doesn't exist
                resolve(null);
            }
        }).catch((error) => {
            console.error(error);
            // Reject the promise if there's an error
            reject(error);
        });
    });
}

function setReleStatus(rele, status) {
    const data = {
        "status": status
    };
    if (!userValidated) {
        return;
    }
    set(child(dbref, `data/slc/reles/${rele}/`), data).then(() => {
        console.log("Data inserted successfully");
        checkStatusRele();
    }).catch((error) => {
        console.error(error);
    });
}

async function checkUserValidated() {
    get(child(dbref, 'data/slc/')).then((data) => {
        userValidated = true;
        getAvailableReles();
    }).catch((error) => {
        console.error(error);
        userValidated = false;

        showToast("Usuário não tem as permissões necessárias", "danger");
    });
}

setInterval(checkStatusRele, 1500);

export { checkUserValidated, getAvailableReles, getReleStatus, insertAllReles, setReleStatus, userValidated };




