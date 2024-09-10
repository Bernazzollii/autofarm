import { getReleStatus, setReleStatus } from '../../db.js';


document.addEventListener('DOMContentLoaded', function () {
    var Calendar = FullCalendar.Calendar;
    var Draggable = FullCalendar.Draggable;

    var containerEl = document.getElementById('external-events');
    var calendarEl = document.getElementById('calendar');
    var checkbox = document.getElementById('drop-remove');

    new Draggable(containerEl, {
        itemSelector: '.fc-event',
        eventData: function (eventEl) {
            console.log("(´༎ຶ۝༎ຶ) -> eventEl:", eventEl);
            return {
                title: eventEl.innerText,
                description: "ligando Irrigação",
                duration: '00:01',
                startEditable: true,
                durationEditable : true,
                GPIO: '0',
            };
        }
    });

    var calendar = new Calendar(calendarEl, {
        locale: 'pt-br',
        editable: true,
        droppable: true,
        // dayMaxEvents: 2, // when too many events in a day, show the popover
        nowIndicator: true,
        allDaySlot: false,
        initialView: 'timeGridDay',
        headerToolbar: {
            left: 'prev,next',
            center: 'title',
            right: 'today,timeGridFourDay,timeGridDay'
        },
        views: {
            timeGridFourDay: {
                type: 'timeGrid',
                duration: { days: 4 },
                buttonText: '4 day'
            }
        },
        eventDidMount: function (info) {
            new Tooltip(info.el, {
                title: info.event.extendedProps.description,
                placement: 'top',
                trigger: 'click',
                container: 'body',
                // delay: { "show": 50, "hide": 10 }
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
        dateClick: function (date) {
            console.log('clicked on', date.dateStr);
        },
        eventStartEditable: function (info) {
            console.log("(´༎ຶ۝༎ຶ) -> eventStartEditable:", info);
        },
        events: [
            {
                id: '0',
                title: 'Irrigação Horta Manhã',
                description: 'Irrigação da horta pela manhã',
                startTime: '10:00',
                endTime: '10:10',
                daysOfWeek: [1, 2, 3, 4, 5],
                GPIO: '0',

            },
            {
                id: '0',
                title: 'Irrigação Horta Tarde',
                description: 'Irrigação da horta pela tarde',
                startTime: '15:00',
                endTime: '15:10',
                daysOfWeek: [1, 2, 3, 4, 5],
                GPIO: '0',
            },

        ]
    });

    calendar.render();
    let time = moment().subtract(3, 'hours').format('HH:mm');
    calendar.scrollToTime(time);
    calendar.updateSize();

    // each 10s update the calendar
    setInterval(() => {
        let events = calendar.getEvents(); // an event object!

        // event should be the closest to current time
        events.sort((a, b) => {
            return moment(a.endStr).isAfter(moment()) ? 1 : -1;
        });
        let event = events[events.length - 1];
        let title = event.title;
        let start = event.startStr;
        let end = event.endStr;
        // add 5 seconds to end time
        let endTime = moment(end).add(5, 'seconds').format();

        let isBetween = moment().isBetween(start, end);
        console.log("(´༎ຶ۝༎ຶ) -> isBetween:", isBetween);
        let isAfter = moment().isBetween(end, endTime);
        console.log("(´༎ຶ۝༎ຶ) -> isAfter:", isAfter);

        if (isBetween) {
            (async () => { // Start of async IIFE
                const status = await getReleStatus(event._def.extendedProps.GPIO); // Wait for the promise to resolve
                if (status == 0) {
                    console.log("Ativando ", title);
                    setReleStatus(event._def.extendedProps.GPIO, 1);
                }
            })(); // End of async IIFE
        }
        if (isAfter) {
            (async () => { // Start of async IIFE
                const status = await getReleStatus(event._def.extendedProps.GPIO); // Wait for the promise to resolve
                console.log("(´༎ຶ۝༎ຶ) -> status:", status);
                if (status == 1) {
                    console.log("Desativando ", title);
                    setReleStatus(event._def.extendedProps.GPIO, 0);
                }
            })(); // End of async IIFE
        }
    }, 5000);

    // scroll to current time when change view
    document.querySelector('.fc-today-button').addEventListener('click', function () {
        calendar.scrollToTime(time);
    });

    document.querySelector('.fc-timeGridDay-button').addEventListener('click', function () {
        calendar.scrollToTime(time);
    });
    document.querySelector('.fc-timeGridFourDay-button').addEventListener('click', function () {
        calendar.scrollToTime(time);
    });

    document.querySelector('.fc-next-button').addEventListener('click', function () {
        calendar.scrollToTime(time);
    });

    document.querySelector('.fc-prev-button').addEventListener('click', function () {
        calendar.scrollToTime(time);
    });
});
