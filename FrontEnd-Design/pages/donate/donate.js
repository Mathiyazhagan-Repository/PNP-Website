(() => {
    const form = document.querySelector('#donate-form');
    const campaign = new URLSearchParams(window.location.search).get('campaign');
    if (pnpCampaigns.has(campaign)) {
        const label = document.querySelector('#donate-campaign-selection');
        label.textContent = 'Campaign preview: ' + pnpCampaigns.get(campaign);
        label.hidden = false;
    }
    const custom = document.querySelector('#donate-custom');
    const total = document.querySelector('#donate-total');
    const other = document.querySelector('#donate-other');
    const customRow = document.querySelector('#donate-custom-row');
    const amountLabel = document.querySelector('#donate-amount-label');
    const mandates = document.querySelector('#donate-mandates');
    const presets = [...form.querySelectorAll('[data-amount]')];
    const currency = new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2
    });
    let preset = 500;

    function showCustom(show) {
        customRow.hidden = !show;
        other.setAttribute('aria-expanded', String(show));
    }

    function amountInPaise() {
        const value = custom.value.trim();
        if (!value) return preset === null ? null : preset * 100;
        if (!/^\d+(?:\.\d{1,2})?$/.test(value)) return null;
        const [rupees, paise = ''] = value.split('.');
        const amount = Number(rupees) * 100 + Number(paise.padEnd(2, '0'));
        return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
    }

    function updateSummary() {
        const amount = amountInPaise();
        const monthly = form.elements.frequency.value === 'monthly';
        amountLabel.textContent = 'Choose an Amount (' + (monthly ? 'Monthly' : 'One-Time') + ')';
        mandates.hidden = !monthly;
        total.textContent = amount === null ? 'Choose an amount' :
            currency.format(amount / 100) + (monthly ? ' per month' : ' one time');

        for (const button of presets) {
            button.setAttribute('aria-pressed', String(Number(button.dataset.amount) === preset));
        }

        custom.setCustomValidity('');
    }

    for (const button of presets) {
        button.addEventListener('click', () => {
            preset = Number(button.dataset.amount);
            custom.value = '';
            showCustom(false);
            updateSummary();
        });
    }

    other.addEventListener('click', () => {
        preset = null;
        showCustom(true);
        updateSummary();
        custom.focus();
    });
    custom.addEventListener('input', () => {
        preset = null;
        updateSummary();
    });
    form.addEventListener('change', updateSummary);
    form.addEventListener('submit', event => {
        event.preventDefault();
        const amount = amountInPaise();
        if (amount === null) {
            showCustom(true);
            custom.setCustomValidity('Choose a preset or enter a positive amount with up to two decimal places.');
            custom.reportValidity();
            return;
        }

        const selection = new URLSearchParams({
            amount: String(amount),
            frequency: form.elements.frequency.value
        });
        if (pnpCampaigns.has(campaign)) selection.set('campaign', campaign);
        window.location.assign('donor-details.html?' + selection.toString());
    });

    form.querySelector('button[type="submit"]').disabled = false;
    updateSummary();
})();
