import { UserConected } from "./auth.js";
import { child, database, get, ref, set } from "./firebaseSDK.js";

function getAvailableReles() {
    const dbref = ref(database);

    get(child(dbref, 'data/slc/')).then((snapshot) => {
        if (snapshot.exists()) {
            console.log(snapshot.val());
            const reles = snapshot.val().reles;
            for (const rele in reles) {
                const releStatus = reles[rele].status;
                console.log(rele, releStatus);
                const div = document.createElement("div");
                div.classList.add("rele");
                const h4 = document.createElement("h4");
                h4.textContent = `Relay #${rele[rele.length - 1]} - GPIO ${rele}`;
                const label = document.createElement("label");
                label.classList.add("switch");
                const input = document.createElement("input");
                input.type = "checkbox";
                // input.onchange = toggleCheckbox;
                input.id = rele;
                input.gpio = 21;
                if (releStatus) {
                    input.checked = true;
                }
                const span = document.createElement("span");
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
            "21": {
                "status": 0
            },
            "22": {
                "status": 0
            },
            "23": {
                "status": 0
            },
            "24": {
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

export { getAvailableReles, insertAllReles };




