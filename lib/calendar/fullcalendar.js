import { getReleStatus, setReleStatus, userValidated } from '../../db.js';


document.addEventListener('DOMContentLoaded', function () {
    var Calendar = FullCalendar.Calendar;
    var Draggable = FullCalendar.Draggable;

    var containerEl = document.getElementById('external-events');
    var calendarEl = document.getElementById('calendar');
    var checkbox = document.getElementById('drop-remove');
    let currentEventId = 0;
    let events = null;
    let event = null;

    new Draggable(containerEl, {
        itemSelector: '.fc-event',
        eventData: function (eventEl) {
            let GPIO = eventEl.querySelector('.fc-event-main').getAttribute('data-gpio');
            let desc = eventEl.querySelector('.fc-event-main').innerText;
            return {
                title: eventEl.innerText,
                description: desc,
                duration: '00:01',
                startEditable: true,
                durationEditable: true,
                GPIO: GPIO,
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
        slotDuration: '00:05:00',
        snapDuration: '00:01:00',
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

            // currentEventId = 0;

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
                startTime: '08:00',
                endTime: '08:30',
                GPIO: '0',

            },
            {
                id: '0',
                title: 'Irrigação Horta Tarde',
                description: 'Irrigação da horta pela tarde',
                startTime: '17:00',
                endTime: '17:30',
                GPIO: '0',
            },

        ]
    });

    calendar.render();
    let sizeOfCalendarScroller = document.querySelector('.fc-scroller').clientHeight;
    let time = moment().subtract(sizeOfCalendarScroller, 'minutes').format('HH:mm');
    calendar.scrollToTime(time);
    calendar.updateSize();

    // each 10s update the calendar
    setInterval(() => {
        events = calendar.getEvents(); // an event object!

        // event should be the closest to current time
        events.sort((a, b) => {
            return moment(a.endStr).isAfter(moment()) ? 1 : -1;
        });
        console.log("(´༎ຶ۝༎ຶ) -> events:", events);
        if (currentEventId == 0) {
            // event should be the closes to current time
            event = events.find(event => {
                return moment(event.endStr).isAfter(moment());
            });
            // event = events[events.length - 1];
        } else {
            // find event with _instance.defId == currentEventId
            event = events.find(event => {
                return event._instance?.instanceId == currentEventId;
            });
        }
        console.log("(´༎ຶ۝༎ຶ) -> currentEventId:", currentEventId);
        console.log("(´༎ຶ۝༎ຶ) -> event:", event);
        if (event && userValidated) {
            let title = event.title;
            let start = event.startStr;
            let end = event.endStr;
            // add 5 seconds to end time
            let endTime = moment(end).add(30, 'seconds').format();

            let isBetween = moment().isBetween(start, end);
            let isAfter = moment().isBetween(end, endTime);

            if (isBetween) {
                currentEventId = event._instance?.instanceId;
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
                    if (status == 1) {
                        console.log("Desativando ", title);
                        setReleStatus(event._def.extendedProps.GPIO, 0);
                        currentEventId = 0;
                    }
                })(); // End of async IIFE
            }
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
