(() => {
    const query = new URLSearchParams(window.location.search);
    const amount = Number(query.get('amount'));
    const frequency = query.get('frequency');
    const campaign = query.get('campaign');
    if (!Number.isSafeInteger(amount) || amount <= 0 || !['once', 'monthly'].includes(frequency)) return;

    const summary = document.querySelector('#donor-summary');
    const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
    summary.textContent = currency.format(amount / 100) + (frequency === 'monthly' ? ' per month' : ' one time');
    summary.hidden = false;
    if (pnpCampaigns.has(campaign)) {
        const label = document.querySelector('#donor-campaign');
        label.textContent = 'Campaign preview: ' + pnpCampaigns.get(campaign);
        label.hidden = false;
    }
    document.querySelector('#donor-missing').hidden = true;

    const form = document.querySelector('#donor-form');
    const name = document.querySelector('#donor-name');
    const mobile = document.querySelector('#donor-mobile');
    const pan = document.querySelector('#donor-pan');

    name.addEventListener('input', () => name.setCustomValidity(''));
    mobile.addEventListener('input', () => { mobile.value = mobile.value.replace(/[^0-9]/g, ''); });
    pan.addEventListener('input', () => { pan.value = pan.value.toUpperCase(); });
    form.addEventListener('submit', event => {
        event.preventDefault();
        if (!name.value.trim()) {
            name.setCustomValidity('Enter your full name.');
            name.reportValidity();
            return;
        }

        form.reset();
        const selection = new URLSearchParams({ amount: String(amount), frequency });
        if (pnpCampaigns.has(campaign)) selection.set('campaign', campaign);
        window.location.assign('payment-processing.html?' + selection.toString());
    });

    form.hidden = false;
    form.querySelector('button[type="submit"]').disabled = false;
})();
