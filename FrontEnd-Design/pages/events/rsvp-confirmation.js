(() => {
    const eventId = new URLSearchParams(window.location.search).get('event') || 'district-dialogue';
    if (!Object.hasOwn(pnpEvents, eventId)) {
        document.querySelector('#confirmation-unavailable').hidden = false;
        return;
    }

    const event = pnpEvents[eventId];
    document.querySelector('#confirmation-event').textContent = event.title;
    const date = document.querySelector('#confirmation-date');
    date.dateTime = event.date;
    const eventDate = new Date(event.date + 'T00:00:00Z');
    const dateOptions = { day: 'numeric', month: 'short', timeZone: 'UTC' };
    const day = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'UTC' }).format(eventDate);
    date.textContent = new Intl.DateTimeFormat('en-GB', dateOptions).format(eventDate) + ' (' + day + ')';
    document.querySelector('#confirmation-time').textContent = '10:00 AM \u2013 ' + event.end;
    document.querySelector('#confirmation-venue').textContent = [event.venue, event.city].filter(Boolean).join(', ');
    document.querySelector('#confirmation-district').textContent = 'District: ' + event.district;
    document.querySelector('#confirmation-banner').hidden = false;
})();
