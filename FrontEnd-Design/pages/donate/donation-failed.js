(async () => {
    const page = document.querySelector('.failed-page');
    const field = key => document.querySelector('#failed-' + key);
    const query = new URLSearchParams(window.location.search);
    const reference = query.get('reference');
    const endpoint = page.dataset.statusEndpoint;
    const retry = field('retry');
    const recheck = field('recheck');
    const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

    function renderFailure(message) {
        page.dataset.state = 'failed';
        field('title').textContent = 'Donation Payment Failed';
        field('message').textContent = message;
        retry.hidden = false;
    }

    if (query.get('preview') === '1') {
        field('label').textContent = 'Checkout Preview';
        field('amount').textContent = money.format(1000);
        field('method').textContent = 'UPI';
        renderFailure('Example: the payment provider declined the transaction. This preview did not initiate a payment.');
        return;
    }

    if (!reference || !endpoint) return;

    const statusUrl = new URL(endpoint, window.location.href);
    if (statusUrl.origin !== window.location.origin || !['https:', 'http:'].includes(statusUrl.protocol)) return;
    statusUrl.searchParams.set('reference', reference);

    async function checkStatus() {
        recheck.disabled = true;
        delete page.dataset.state;
        retry.hidden = true;
        field('message').textContent = 'Checking the original payment status.';
        try {
            const response = await fetch(statusUrl, { cache: 'no-store', credentials: 'same-origin' });
            if (!response.ok) throw new Error('Status could not be checked');
            const data = await response.json();
            if (data.reference !== reference) throw new Error('Unexpected reference');

            if (data.status === 'confirmed') {
                window.location.replace('donation-success.html?' + new URLSearchParams({ reference }));
                return;
            }

            field('reference').textContent = data.reference;
            if (Number.isSafeInteger(data.amountPaise) && data.amountPaise > 0) {
                field('amount').textContent = money.format(data.amountPaise / 100);
            }
            if (typeof data.paymentMode === 'string') field('method').textContent = data.paymentMode;

            if (data.status === 'failed' && data.canRetry === true) {
                renderFailure('The payment did not complete. If your bank shows no debit, you can start a new donation.');
            } else if (data.status === 'failed') {
                page.dataset.state = 'failed';
                field('title').textContent = 'Donation Payment Failed';
                field('message').textContent = 'Retry is unavailable for this transaction. Check with your payment provider.';
            } else if (data.status === 'pending') {
                field('title').textContent = 'Payment Still Pending';
                field('message').textContent = 'Wait for the original payment to resolve before trying again.';
            } else {
                throw new Error('Unknown payment status');
            }
        } catch {
            field('title').textContent = 'Payment Status Unverified';
            field('message').textContent = 'Payment status could not be checked. Confirm it with your payment provider first.';
        } finally {
            recheck.disabled = false;
        }
    }

    recheck.hidden = false;
    recheck.addEventListener('click', checkStatus);
    await checkStatus();
})();
