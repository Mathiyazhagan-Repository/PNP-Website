(() => {
    const form = document.querySelector('#register-form');
    const opportunity = new URLSearchParams(window.location.search).get('opportunity');
    if (pnpVolunteerOpportunities.has(opportunity)) {
        const label = document.querySelector('#register-opportunity');
        label.textContent = 'Opportunity preview: ' + pnpVolunteerOpportunities.get(opportunity);
        label.hidden = false;
    }
    const name = document.querySelector('#register-name');
    const mobile = document.querySelector('#register-mobile');
    const district = document.querySelector('#register-district');
    const review = document.querySelector('#register-review');
    const otp = document.querySelector('#register-otp');
    const digits = [...otp.querySelectorAll('.register-code input')];
    const otpStatus = document.querySelector('#register-otp-status');
    const countdown = document.querySelector('#register-otp-countdown');
    const resend = document.querySelector('#register-resend');
    const previewCode = '123456';
    let resendTimer;
    const details = document.querySelector('#register-review-details');
    const steps = [...document.querySelectorAll('.register-steps li')];
    const groups = ['skills', 'interests'].map(group => [...form.querySelectorAll('[name="' + group + '"]')]);
    const districts = ['Bagalkote','Ballari','Belagavi','Bengaluru Rural','Bengaluru South','Bengaluru Urban','Bidar','Chamarajanagar','Chikkaballapura','Chikkamagaluru','Chitradurga','Dakshina Kannada','Davanagere','Dharwad','Gadag','Hassan','Haveri','Kalaburagi','Kodagu','Kolar','Koppal','Mandya','Mysuru','Raichur','Shivamogga','Tumakuru','Udupi','Uttara Kannada','Vijayanagara','Vijayapura','Yadgir'];

    for (const item of districts) district.add(new Option(item, item));

    function validateGroups() {
        for (const group of groups) {
            group[0].setCustomValidity(group.some(input => input.checked) ? '' : 'Select at least one option in this group.');
        }
    }

    function showStep(index) {
        steps.forEach((step, position) => {
            if (position === index) step.setAttribute('aria-current', 'step');
            else step.removeAttribute('aria-current');
        });
        form.hidden = index !== 0;
        review.hidden = index !== 1;
        otp.hidden = index !== 2;
        const focus = [name, review.querySelector('h2'), digits[0]][index];
        focus.focus();
    }

    mobile.addEventListener('input', () => { mobile.value = mobile.value.replace(/[^0-9]/g, ''); });
    name.addEventListener('input', () => name.setCustomValidity(''));
    form.addEventListener('change', validateGroups);
    form.addEventListener('submit', event => {
        event.preventDefault();
        if (!name.value.trim()) {
            name.setCustomValidity('Enter your full name.');
            name.reportValidity();
            return;
        }

        const values = new FormData(form);
        details.replaceChildren();
        for (const [label, value] of [
            ['District', values.get('district')],
            ['Skills', values.getAll('skills').join(', ')],
            ['Interests', values.getAll('interests').join(', ')],
            ['Availability', values.get('availability')],
            ['Preferred language', values.get('language')]
        ]) {
            const row = document.createElement('div');
            const term = document.createElement('dt');
            const description = document.createElement('dd');
            term.textContent = label;
            description.textContent = value;
            row.append(term, description);
            details.append(row);
        }
        showStep(1);
    });

    document.querySelector('#register-edit').addEventListener('click', () => showStep(0));
    function startCooldown() {
        window.clearInterval(resendTimer);
        const availableAt = Date.now() + 28000;
        function update() {
            const seconds = Math.max(0, Math.ceil((availableAt - Date.now()) / 1000));
            countdown.textContent = seconds ? 'in ' + seconds + 's' : '';
            resend.disabled = seconds > 0;
            if (!seconds) window.clearInterval(resendTimer);
        }
        update();
        resendTimer = window.setInterval(update, 1000);
    }

    document.querySelector('#register-confirm').addEventListener('click', () => {
        const number = mobile.value;
        document.querySelector('#register-otp-mobile').textContent =
            '+91 ' + number.slice(0, 2) + 'XXXXXX' + number.slice(-2);
        otp.reset();
        otpStatus.textContent = '';
        startCooldown();
        showStep(2);
    });

    for (const [index, input] of digits.entries()) {
        input.addEventListener('input', () => {
            input.value = input.value.replace(/[^0-9]/g, '').slice(0, 1);
            otpStatus.textContent = '';
            if (input.value) digits[index + 1]?.focus();
        });
        input.addEventListener('keydown', event => {
            if (event.key === 'Backspace' && !input.value) digits[index - 1]?.focus();
        });
        input.addEventListener('paste', event => {
            const code = event.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, digits.length);
            if (!code) return;
            event.preventDefault();
            const start = code.length === digits.length ? 0 : index;
            for (let offset = 0; offset < code.length && start + offset < digits.length; offset++) {
                digits[start + offset].value = code[offset];
            }
            otpStatus.textContent = '';
            digits[Math.min(start + code.length, digits.length - 1)].focus();
        });
    }

    resend.addEventListener('click', () => {
        for (const input of digits) input.value = '';
        otpStatus.textContent = 'The preview code is still 123456. No SMS was sent.';
        startCooldown();
        digits[0].focus();
    });

    document.querySelector('#register-otp-back').addEventListener('click', () => {
        window.clearInterval(resendTimer);
        showStep(1);
    });

    otp.addEventListener('submit', event => {
        event.preventDefault();
        if (digits.map(input => input.value).join('') !== previewCode) {
            otpStatus.textContent = 'Enter the preview code 123456.';
            digits[0].focus();
            return;
        }

        window.clearInterval(resendTimer);
        form.reset();
        otp.reset();
        details.replaceChildren();
        document.querySelector('#register-otp-mobile').textContent = '';
        validateGroups();
        window.location.assign('volunteer-success.html?preview=1');
    });
    validateGroups();
    form.querySelector('button[type="submit"]').disabled = false;
})();
