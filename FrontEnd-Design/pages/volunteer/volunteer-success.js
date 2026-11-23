(() => {
    if (new URLSearchParams(window.location.search).get('preview') !== '1') return;
    document.querySelector('.vol-success').setAttribute('data-preview', '');
    document.querySelector('#vol-success-title').firstChild.textContent = 'Registration ';
    document.querySelector('#vol-success-state').textContent = 'Preview Complete!';
    document.querySelector('#vol-success-lead').textContent = 'Thank you for trying the PNP volunteer registration.';
    document.querySelector('#vol-success-copy').hidden = false;
})();
