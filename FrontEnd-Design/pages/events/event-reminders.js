(() => {
    const eventId = new URLSearchParams(window.location.search).get('event') || 'district-dialogue';
    const form = document.querySelector('#reminders-form');
    const status = document.querySelector('#reminders-status');
    if (!Object.hasOwn(pnpEvents, eventId)) {
        document.querySelector('.reminders-event').hidden = true;
        status.textContent = 'This event is unavailable. Use Back to Events to select another event.';
        return;
    }

    const event = pnpEvents[eventId];
    const photo = document.querySelector('#reminders-photo');
    const date = document.querySelector('#reminders-date');
    photo.src = '../../assets/hero/' + event.photo;
    photo.alt = event.alt;
    date.dateTime = event.date;
    date.textContent = new Intl.DateTimeFormat('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'
    }).format(new Date(event.date + 'T00:00:00Z'));
    document.querySelector('#reminders-event-title').textContent = event.title;
    document.querySelector('#reminders-venue').textContent = [event.venue, event.city].filter(Boolean).join(', ');

    const phone = document.querySelector('#reminders-phone');
    const email = document.querySelector('#reminders-email');
    const channels = [...form.querySelectorAll('[name="channel"]')];

    function updateRequirements() {
        const selected = channels.filter(channel => channel.checked);
        phone.required = selected.some(channel => channel.value !== 'Email');
        email.required = selected.some(channel => channel.value === 'Email');
        channels[0].setCustomValidity(selected.length ? '' : 'Select at least one reminder channel.');
        status.textContent = '';
    }

    form.addEventListener('change', updateRequirements);
    form.addEventListener('submit', (submission) => {
        submission.preventDefault();
        const settings = new FormData(form);
        status.textContent = 'Preview selection: ' + settings.getAll('channel').join(', ') +
            ' / ' + settings.get('timing') + '. No alerts were scheduled.';
        phone.value = '';
        email.value = '';
    });

    updateRequirements();
    form.querySelector('button[type="submit"]').disabled = false;
})();
