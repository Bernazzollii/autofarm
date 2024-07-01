import { UserConected } from "./auth.js";
import { child, database, get, ref, set } from "./firebaseSDK.js";

function toggleCheckbox(rele) {
    const dbref = ref(database);
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

function getAvailableReles() {
    const dbref = ref(database);

    get(child(dbref, 'data/slc/')).then((snapshot) => {
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
                    case "5":
                        title = "Caixa d'água chiqueiro";
                        break;
                    case "16":
                        title = "Sem uso";
                        label.classList.add("disabled");
                        break;
                    case "17":
                        title = "Sem uso";
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
                    atLeastOneReleTrue = true;
                }
                if (rele == "16" || rele == "17") {
                    input.disabled = true;
                }
                if (rele == "4" && !atLeastOneReleTrue) {
                    input.checked = true;
                }
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
    const dbref = ref(database);
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
            "5": {
                "status": 0
            }
        }
    };

    set(child(dbref, 'data/slc/'), data).then(() => {
        console.log("Data inserted successfully");
    }).catch((error) => {
        console.error(error);
    });
}

async function initConfigs() {
    UserConected.then((user) => {
        getAvailableReles();
    }).catch((error) => {
        console.error(error);
    });
}

function checkStatusRele() {
    const dbref = ref(database);
    get(child(dbref, 'data/slc/')).then((snapshot) => {
        if (snapshot.exists()) {
            let atLeastOneReleTrue = false;
            const reles = snapshot.val().reles;
            for (const rele in reles) {
                const releStatus = reles[rele].status;
                const input = document.getElementById(rele);
                if (releStatus) {
                    input.checked = true;
                    atLeastOneReleTrue = true;
                } else {
                    input.checked = false;
                }
            }

            if (!atLeastOneReleTrue) {
                // If no rele is on, turn on the GPIO 4
                const input = document.getElementById("4");
                input.checked = true;
            }
        }
    }).catch((error) => {
        console.error(error);
    });

}

function getReleStatus(rele) {
    const dbref = ref(database);
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
    const dbref = ref(database);
    const data = {
        "status": status
    };
    set(child(dbref, `data/slc/reles/${rele}/`), data).then(() => {
        console.log("Data inserted successfully");
        checkStatusRele();
    }).catch((error) => {
        console.error(error);
    });
}

setInterval(checkStatusRele, 1500);

export { getAvailableReles, getReleStatus, insertAllReles, setReleStatus };




