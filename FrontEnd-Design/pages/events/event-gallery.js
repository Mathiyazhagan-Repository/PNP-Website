(() => {
    const grid = document.querySelector('#gallery-grid');
    const switches = document.querySelectorAll('[data-gallery-view]');
    const more = document.querySelector('.gallery-more');
    const extra = grid.querySelector('.gallery-extra');
    const dialog = document.querySelector('.gallery-dialog');
    const dialogImage = dialog.querySelector('img');
    const dialogTitle = dialog.querySelector('h2');
    const videoNotice = dialog.querySelector('p');

    for (const button of switches) {
        button.addEventListener('click', () => {
            grid.dataset.view = button.dataset.galleryView;
            for (const option of switches) {
                option.setAttribute('aria-pressed', String(option === button));
            }
            more.hidden = grid.dataset.view === 'videos';
        });
    }

    more.addEventListener('click', () => {
        extra.hidden = !extra.hidden;
        more.setAttribute('aria-expanded', String(!extra.hidden));
        more.firstChild.textContent = extra.hidden ? 'View More ' : 'Show Less ';
        if (!extra.hidden) extra.focus();
    });

    grid.addEventListener('click', (event) => {
        const tile = event.target.closest('.gallery-tile');
        if (!tile) return;

        const image = tile.querySelector('img');
        dialogImage.src = image.src;
        dialogImage.alt = image.alt;
        dialogTitle.textContent = tile.querySelector('.gallery-caption').textContent.trim();
        videoNotice.hidden = !tile.classList.contains('gallery-video');
        dialog.showModal();
    });
})();
