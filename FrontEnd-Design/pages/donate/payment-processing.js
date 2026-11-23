(() => {
    const query = new URLSearchParams(window.location.search);
    const amount = Number(query.get('amount'));
    const frequency = query.get('frequency');
    const campaign = query.get('campaign');
    const methods = [...document.querySelectorAll('[data-method]')];
    const panels = [...document.querySelectorAll('[data-panel]')];
    const selection = document.querySelector('#payment-selection');
    const preview = document.querySelector('#payment-processing-preview');
    const proceed = document.querySelector('#payment-proceed');

    for (const method of methods) {
        method.addEventListener('click', () => {
            for (const option of methods) option.setAttribute('aria-pressed', String(option === method));
            for (const panel of panels) panel.hidden = panel.dataset.panel !== method.dataset.method;
        });
    }

    if (!Number.isSafeInteger(amount) || amount <= 0 || !['once', 'monthly'].includes(frequency)) return;

    const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
    const amountLabel = money.format(amount / 100);
    document.querySelector('#payment-amount').textContent = amountLabel;
    const frequencyLabel = frequency === 'monthly' ? 'Monthly' : 'One-Time';
    document.querySelector('#payment-frequency').textContent = frequencyLabel;
    const details = new URLSearchParams({ amount: String(amount), frequency });
    if (pnpCampaigns.has(campaign)) {
        details.set('campaign', campaign);
        document.querySelector('#payment-campaign').textContent = pnpCampaigns.get(campaign);
        document.querySelector('#processing-campaign').textContent = pnpCampaigns.get(campaign);
    }
    document.querySelector('#payment-back').href = 'donor-details.html?' + details.toString();
    document.querySelector('#payment-back').textContent = 'Back to Donor Details';
    if (frequency === 'monthly') {
        document.querySelector('#payment-upi-info').textContent =
            'Monthly UPI donations require an AutoPay mandate through the payment gateway.';
    }

    let previewTimer;
    proceed.disabled = false;
    proceed.addEventListener('click', () => {
        // Start the approved gateway only after receiving a valid server-side payment order.
        const selectedMethod = methods.find(method => method.getAttribute('aria-pressed') === 'true');
        document.querySelector('#processing-amount').textContent = amountLabel;
        document.querySelector('#processing-frequency').textContent = frequencyLabel;
        document.querySelector('#processing-method').textContent = selectedMethod.textContent.trim();
        selection.hidden = true;
        preview.hidden = false;
        document.querySelector('#processing-title').focus();
        previewTimer = window.setTimeout(() => {
            preview.hidden = true;
            selection.hidden = false;
            window.location.assign('donation-success.html?preview=1');
        }, 2400);
    });

    document.querySelector('#processing-back').addEventListener('click', () => {
        window.clearTimeout(previewTimer);
        preview.hidden = true;
        selection.hidden = false;
        proceed.focus();
    });
})();
