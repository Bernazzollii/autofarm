import { getReleStatus, setReleStatus } from '../../db.js';


document.addEventListener('DOMContentLoaded', function () {
    var Calendar = FullCalendar.Calendar;
    var Draggable = FullCalendar.Draggable;

    var containerEl = document.getElementById('external-events');
    var calendarEl = document.getElementById('calendar');
    var checkbox = document.getElementById('drop-remove');

    // new Draggable(containerEl, {
    //     itemSelector: '.fc-event',
    //     eventData: function (eventEl) {
    //         return {
    //             title: eventEl.innerText
    //         };
    //     }
    // });

    var calendar = new Calendar(calendarEl, {
        initialView: 'timeGridDay',
        locale: 'pt-br',
        editable: true,
        droppable: true,
        // dayMaxEvents: 2, // when too many events in a day, show the popover
        nowIndicator: true,
        allDaySlot: false,
        headerToolbar: {
            end: 'dayGridMonth,timeGridDay',
            // end: 'custom2 prevYear,prev,next,nextYear'
        },
        eventDidMount: function (info) {
            new Tooltip(info.el, {
                title: info.event.extendedProps.description,
                placement: 'top',
                trigger: 'hover',
                container: 'body',
                delay: { "show": 500, "hide": 10 }
            });
        },
        drop: function (info) {
            // is the "remove after drop" checkbox checked?
            // if (checkbox.checked) {
            //     // if so, remove the element from the "Draggable Events" list
            //     info.draggedEl.parentNode.removeChild(info.draggedEl);
            // }

        },
        eventReceive: function (info) {
            console.log("(´༎ຶ۝༎ຶ) -> eventReceive:", info);
        },
        eventDrop: function (info) {
            console.log("(´༎ຶ۝༎ຶ) -> eventDrop:", info);
        },
        eventLeave: function (info) {
            console.log("(´༎ຶ۝༎ຶ) -> eventLeave:", info);
        },
        events: [
            {
                id: '0',
                title: 'Irrigação Horta Manhã',
                description: 'Irrigação da horta pela manhã',
                startTime: '10:00',
                endTime: '10:10',
                daysOfWeek: [1, 2, 3, 4, 5]
            },
            {
                id: '1',
                title: 'Irrigação Horta Tarde',
                description: 'Irrigação da horta pela tarde',
                startTime: '15:00',
                endTime: '15:10',
                daysOfWeek: [1, 2, 3, 4, 5]
            },
            {
                id: '16',
                title: 'teste',
                description: 'Irrigação da horta pela noite',
                startTime: '20:09',
                endTime: '20:10',
            }

        ]
    });

    calendar.render();

    // each 10s update the calendar
    setInterval(() => {
        let event = calendar.getEvents()[1]; // an event object!
        let title = event.title;
        let start = event.startStr;
        let end = event.endStr;

        let isBetween = moment().isBetween(start, end);
        let isAfter = moment().isAfter(end);

        if (isBetween) {
            (async () => { // Start of async IIFE
                const status = await getReleStatus(event.id); // Wait for the promise to resolve
                if (status == 0) {
                    console.log("Ativando ", title);
                    setReleStatus(event.id, 1);
                }
            })(); // End of async IIFE
        }
        if (isAfter) {
            (async () => { // Start of async IIFE
                const status = await getReleStatus(event.id); // Wait for the promise to resolve
                if (status == 1) {
                    console.log("Desativando ", title);
                    setReleStatus(event.id, 0);
                }
            })(); // End of async IIFE
        }
    }, 1000);
});
