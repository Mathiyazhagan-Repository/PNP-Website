(async () => {
    const result = document.querySelector('.donation-result');
    const status = document.querySelector('#result-status');
    const query = new URLSearchParams(window.location.search);
    if (query.get('preview') === '1') {
        const details = {
            amount: '\u20b95,000',
            mode: 'Credit Card',
            receipt: 'PNP/DTN/2026/0458',
            name: 'Ravi Kumar',
            date: '25 Nov 2026'
        };
        for (const [field, value] of Object.entries(details)) {
            document.querySelector('#result-' + field).textContent = value;
        }

        result.setAttribute('data-preview', '');
        document.querySelector('.result-steps').setAttribute('aria-label', 'Checkout preview steps');
        document.querySelector('#result-step-verify').textContent = 'Payment Preview';
        document.querySelector('#result-step-complete').textContent = 'Preview Complete';
        document.querySelector('#result-subtitle').textContent = 'Receipt Preview';
        status.textContent = 'Checkout preview. Donor and receipt details are for illustration only. No payment was verified.';
        return;
    }

    const reference = query.get('reference');
    const endpoint = result.dataset.statusEndpoint;
    if (!endpoint || !reference) return;

    const write = (key, value) => {
        if (typeof value === 'string' && value.trim()) {
            document.querySelector('#result-' + key).textContent = value;
        }
    };

    function enableLink(key, value) {
        if (typeof value !== 'string' || !value.trim()) return;
        let url;
        try {
            url = new URL(value, window.location.href);
        } catch {
            return;
        }
        if (url.origin !== window.location.origin || !['https:', 'http:'].includes(url.protocol)) return;

        const link = document.querySelector('#result-' + key);
        link.href = url.href;
        link.removeAttribute('aria-disabled');
    }

    try {
        // Configure a same-origin, authenticated backend status endpoint before enabling live checkout.
        const url = new URL(endpoint, window.location.href);
        if (url.origin !== window.location.origin) return;
        url.searchParams.set('reference', reference);
        status.textContent = 'Checking payment status.';
        const response = await fetch(url, { cache: 'no-store', credentials: 'same-origin' });
        if (!response.ok) throw new Error('Payment status unavailable');
        const data = await response.json();
        if (data.status !== 'confirmed' || data.reference !== reference ||
            !Number.isSafeInteger(data.amountPaise) || data.amountPaise <= 0) {
            status.textContent = 'Payment confirmation is unavailable.';
            return;
        }

        const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
        write('amount', money.format(data.amountPaise / 100));
        write('mode', data.paymentMode);
        write('receipt', data.receiptNumber);
        write('name', data.donorName);
        write('date', data.donationDateLabel);
        if (typeof data.receiptNumber === 'string' && data.receiptNumber.trim()) {
            enableLink('download', data.receiptDownloadUrl);
            enableLink('print', data.receiptPrintUrl);
        }

        result.setAttribute('data-verified', '');
        write('subtitle', 'Official Acknowledgement');
        status.textContent = 'Payment verified.';
    } catch {
        status.textContent = 'Payment status could not be verified. Please try again later.';
    }
})();
