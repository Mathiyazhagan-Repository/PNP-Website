(() => {
    const form = document.querySelector('#rsvp-form');
    const field = document.querySelector('#rsvp-code');
    const heading = document.querySelector('#rsvp-step-title');
    const submit = document.querySelector('#rsvp-submit');
    const hint = document.querySelector('#rsvp-hint span');
    const back = document.querySelector('#rsvp-back');
    const steps = [...document.querySelectorAll('.rsvp-steps li')];
    const initialHint = hint.textContent;
    const eventId = new URLSearchParams(window.location.search).get('event') || 'district-dialogue';
    const eventLabel = document.querySelector('#rsvp-event');

    if (Object.hasOwn(pnpEvents, eventId)) {
        eventLabel.textContent = pnpEvents[eventId].title;
        eventLabel.hidden = false;
    }
    const previewCode = '123456';
    let step = 0;

    function showStep(nextStep) {
        steps[step].removeAttribute('aria-current');
        step = nextStep;
        steps[step].setAttribute('aria-current', 'step');
    }

    field.addEventListener('input', () => {
        field.value = field.value.replace(/[^0-9]/g, '');
        field.setCustomValidity('');
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        if (step === 0) {
            showStep(1);
            heading.textContent = 'Step 2: Enter Your OTP';
            field.value = '';
            field.setAttribute('aria-label', 'Verification code');
            field.autocomplete = 'one-time-code';
            field.placeholder = 'Enter 6-digit OTP';
            field.pattern = '[0-9]{6}';
            field.maxLength = 6;
            submit.firstChild.textContent = 'Verify OTP ';
            hint.textContent = 'Use the preview code ' + previewCode + '.';
            back.hidden = false;
            field.focus();
            return;
        }

        if (field.value !== previewCode) {
            field.setCustomValidity('Enter the preview code shown below.');
            field.reportValidity();
            return;
        }

        field.value = '';
        window.location.assign('rsvp-confirmation.html?event=' + encodeURIComponent(eventId));
    });

    back.addEventListener('click', () => {
        showStep(0);
        form.reset();
        field.setCustomValidity('');
        heading.textContent = 'Step 1: Verify Your Mobile Number';
        field.setAttribute('aria-label', 'Mobile number');
        field.autocomplete = 'tel-national';
        field.placeholder = 'Enter 10-digit mobile number';
        field.pattern = '[0-9]{10}';
        field.maxLength = 10;
        submit.firstChild.textContent = 'Get OTP ';
        hint.textContent = initialHint;
        back.hidden = true;
        field.focus();
    });

    submit.disabled = false;
})();
