(() => {
    const eventId = new URLSearchParams(window.location.search).get('event') || 'district-dialogue';
    const preview = document.querySelector('#detail-preview');
    if (!Object.hasOwn(pnpEvents, eventId)) {
        preview.hidden = true;
        document.querySelector('#detail-unavailable').hidden = false;
        return;
    }

    const event = pnpEvents[eventId];
    preview.querySelector('.detail-rsvp').href = 'event-rsvp.html?event=' + encodeURIComponent(eventId);
    preview.querySelector('#detail-reminders').href = 'event-reminders.html?event=' + encodeURIComponent(eventId);
    const location = [event.venue || event.city, event.venue ? event.city : 'Karnataka'].join(', ');
    const title = preview.querySelector('#detail-title');
    if (eventId !== 'district-dialogue') title.textContent = event.title;
    document.title = event.title + ' | PNP';
    preview.querySelector('.detail-intro').textContent = event.description;

    const date = new Date(event.date + 'T00:00:00Z');
    const time = preview.querySelector('time');
    time.dateTime = event.date;
    time.querySelector('strong').textContent = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit', month: 'short', timeZone: 'UTC'
    }).format(date);
    const weekday = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'UTC' }).format(date);
    time.querySelector('span').textContent = '(' + weekday + ')';
    preview.querySelector('#detail-end').textContent = event.end;

    const photo = preview.querySelector('.detail-photo');
    photo.src = '../../assets/hero/' + event.photo;
    photo.alt = event.alt;
    preview.querySelector('.detail-copy').style.setProperty('--detail-photo', 'url("' + photo.src + '")');

    preview.querySelector('#detail-location-label').textContent = event.venue ? 'Event Venue' : 'Event Location';
    preview.querySelector('#detail-location').textContent = location;
    preview.querySelector('#detail-venue-name').textContent = (event.venue || event.city) + ',';
    preview.querySelector('#detail-venue-city').textContent = event.venue ? event.city : 'Karnataka';
    preview.querySelector('#detail-district').textContent = event.district;

    const encodedLocation = encodeURIComponent(location);
    preview.querySelector('.detail-venue').href = 'https://www.google.com/maps/search/?api=1&query=' + encodedLocation;
    const directions = preview.querySelector('.detail-directions');
    directions.href = 'https://www.google.com/maps/dir/?api=1&destination=' + encodedLocation;
    if (!event.venue) directions.setAttribute('aria-label', 'Get directions to ' + location);

    const status = preview.querySelector('.detail-status');
    for (const button of preview.querySelectorAll('[data-preview-message]')) {
        button.addEventListener('click', () => {
            status.textContent = button.dataset.previewMessage;
        });
    }
})();
