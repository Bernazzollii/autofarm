
var gateway = `ws://${window.location.hostname}:81`;
var websocket;
window.addEventListener('load', onload);

let gpioElements = document.querySelectorAll('.rele-list input');
let pickers = document.querySelectorAll('.js-time-picker');
let picker1 = document.querySelector('.picker_js .pick1');
let picker2 = document.querySelector('.picker_js .pick2');

radioChoice = document.querySelector('input[type="radio"]').value;

let control = document.querySelector('.auto_start[type="checkbox"]');

let query = {};


// pickers.forEach((el) => {
//     new Picker(el, {
//         format: 'HH:mm',
//         headers: true,
//         controls: true,
//         text: {
//             title: 'Pick a time',
//         },
//     });
// });

// let pickerInit;
// let pickerFinal;
// let momentPicker;


// picker1.addEventListener('change', (pick) => {
//     pickerInit = pickers.item(0).picker.date.toISOString();
//     // momentPicker = moment(pickerFinal);
// });

// picker2.addEventListener('change', (pick) => {
//     pickerFinal = pickers.item(1).picker.date.toISOString();
//     // momentPicker = moment(pickerFinal);
// });

setInterval(() => { this.showCurrentDate(); }, 1000);



function showCurrentDate() {
    moment.locale('pt-br');
    let momentTime = moment().format('DD/MM/YYYY HH:mm:ss');
    document.querySelector('.current_time').innerHTML = momentTime;
}

function onload(event) {
    initWebSocket();
}

function initWebSocket() {
    console.log('Trying to open a WebSocket connection¦');
    websocket = new WebSocket(gateway);
    websocket.onopen = onOpen;
    websocket.onclose = onClose;
    websocket.onmessage = onMessage;
}

function onOpen(event) {
    console.log('Connection opened');
    setTimeout(verify, 500);
}

function verify() {
    websocket.send('verify');
}

function onClose(event) {
    console.log('Connection closed');
    setTimeout(initWebSocket, 2000);
}

function onMessage(event) {
    let myObj = JSON.parse(event.data);

    let reles = myObj.reles;
    let control = myObj.control;

    let status = [];
    let GPIO = [];

    reles.forEach((rele) => {
        status.push(rele.split(":")[0]);
        GPIO.push(rele.split(":")[1]);
    });

    if (control == true || control == '1' || control == 'true') {
        document.querySelector('.auto_start').checked = true;
    } else {
        document.querySelector('.auto_start').checked = false;
    }

    for (let i = 0; i < status.length; i++) {
        updateRele(status[i], GPIO[i]);
    }
}

function updateRele(status, GPIO) {
    let rele = document.querySelector("input[gpio='" + GPIO + "']");
    rele.checked = status == '1' ? true : false;
}

function toggleCheckbox() {
    let answer = {};
    answer["reles"] = [];
    answer["control"] = control.checked;
    gpioElements.forEach((el) => {
        rele = "";
        rele += el.checked ? '1' : '0';
        rele += ":";
        rele += el.attributes.gpio.value.toString();
        answer["reles"].push(rele);
    });
    console.log('answer', answer);
    setTimeout(() => {

        websocket.send(JSON.stringify(answer));
    }, 500);
}

function answerWebSocket() {
    let answer = {};
    answer["reles"] = [];
    answer["control"] = control.checked ? '1' : '0';
    gpioElements.forEach((el) => {
        rele = "";
        rele += el.checked ? '1' : '0';
        rele += ":";
        rele += el.attributes.gpio.value.toString();
        answer["reles"].push(rele);
    });
    console.log('answer', answer);
    websocket.send(JSON.stringify(answer));
}

function toggleStartStop(element) {
    console.log(element.checked ? '1' : '0');
    let patchvalue = element.checked ? '1' : '0';
    query["reles"] = {};
    query["control"] = patchvalue;
    websocket.send(query);
    // websocket.send(patchvalue);
}

// Function to turn on all the rele if current hour and minute is same as the first input e turn off if is the same as the second input
function turnOnRele() {

    // let momentInit = moment(pickerInit);
    // let momentFinal = moment(pickerFinal);
    // let momentNow = moment();

    // if (moment().isSame(pickerInit, 'minute')) {
    //     console.log('Ligando');
    //     gpioElements.forEach(element => {
    //         // console.log(element);
    //         element.checked = true;
    //         toggleCheckbox(element);
    //     });
    // }
    let momentInit = moment(pickerInit);
    let momentFinal = moment(pickerFinal);
    let momentNow = moment();

    if (pickerFinal && pickerInit && !isAllReleOn()) {
        if (moment().isSame(momentInit, 'minute')) {
            gpioElements.forEach((el) => {
                el.checked = true;
                toggleCheckbox(el);
            });
        }
    }
    else if (pickerFinal && pickerInit && isAllReleOn()) {
        if (moment().isSame(momentFinal, 'minute')) {
            gpioElements.forEach((el) => {
                el.checked = false;
                toggleCheckbox(el);
            });
            picker1.value = '';
            picker2.value = '';
        }
    }
}

function isAllReleOn() {
    let allReleOn = true;
    gpioElements.forEach((el) => {
        if (!el.checked) {
            allReleOn = false;
        }
    });
    return allReleOn;
}

// function turnOnRele() {
//     let momentTime = moment().format('HH:mm');
//     let momentPickerInit = moment(pickerInit).format('HH:mm');
//     let momentPickerFinal = moment(pickerFinal).format('HH:mm');

//     if (momentTime == momentPickerInit) {
//         console.log('Ligando');
//         gpioElements.forEach(element => {
//             // console.log(element);
//             element.checked = true;
//             toggleCheckbox(element);
//         });
//     }

//     if (momentTime == momentPickerFinal) {
//         console.log('Desligando');
//         gpioElements.forEach(element => {
//             // console.log(element);
//             element.checked = false;
//             toggleCheckbox(element);
//         });
//     }
// }
let myInterval;

function stopInterval() {
    clearInterval(myInterval);
}


function validateTimeToTurnOn(currentMinute, timeAmount) {
    if (timeAmount != '') {
        turnOnAllRele();
        if (moment().isSameOrAfter(timeAmount, 'minute')) {
            stopInterval();
            stopRele();
        }
    }
}

function stopRele() {
    gpioElements.forEach(element => {
        // console.log(element);
        if (element.checked == true) {
            element.checked = false;
        }
    });

    let autoStartFInish = document.querySelector('.auto_start[type="checkbox"]');
    autoStartFInish.checked = false;
    setTimeout(() => {
        toggleCheckbox();
    }, 1000);
}

function turnOnAllRele() {
    gpioElements.forEach(element => {
        // console.log(element);
        if (element.checked == false) {
            element.checked = true;
        }
    });
}

function startRele() {
    let qtdTimePicker = document.querySelectorAll('.js-time-picker')[0].value;
    let typeMinutePicker = document.querySelectorAll('input[type="radio"]')[0].checked;
    let typeHourPicker = document.querySelectorAll('input[type="radio"]')[1].checked;
    let autoStartFInish = document.querySelector('.auto_start[type="checkbox"]');

    let currentHourMinute1 = moment().format();
    let timeAmount1 = '';

    if (autoStartFInish.checked) {
        if (typeMinutePicker) {
            timeAmount1 = moment().add(qtdTimePicker, 'minutes').format();
        }
        else if (typeHourPicker) {
            timeAmount1 = moment().add(qtdTimePicker, 'hours').format();

        } else {
        }
        myInterval = setInterval(validateTimeToTurnOn, 1000, currentHourMinute1, timeAmount1);
        setTimeout(() => {
            toggleCheckbox();
        }, 1000);
    }
    else {
        stopInterval();
    }


}




