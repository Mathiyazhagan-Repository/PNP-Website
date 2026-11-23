(() => {
    const filters = [...document.querySelectorAll('[data-task-filter]')];
    const cards = [...document.querySelectorAll('.task-card')];
    const empty = document.querySelector('#tasks-empty');
    const status = document.querySelector('#tasks-status');
    const dialog = document.querySelector('#task-dialog');
    const title = document.querySelector('#task-dialog-title');
    const info = document.querySelector('#task-dialog-info');
    const form = document.querySelector('#task-progress-form');
    const input = document.querySelector('#task-progress-input');
    let filter = 'all';
    let selected;

    function updateList() {
        for (const card of cards) card.hidden = filter !== 'all' && filter !== card.dataset.taskState;
        empty.hidden = cards.some(card => !card.hidden);
        for (const button of filters) {
            button.setAttribute('aria-pressed', String(button.dataset.taskFilter === filter));
        }
    }

    function updateTotals() {
        // The reference shows two more assignments than the featured cards.
        for (const state of ['active', 'completed']) {
            const count = 1 + cards.filter(card => card.dataset.taskState === state).length;
            document.querySelector('#tasks-filter-' + state).textContent = count;
            document.querySelector('#tasks-total-' + state).textContent = count;
        }
    }

    for (const button of filters) {
        button.addEventListener('click', () => {
            filter = button.dataset.taskFilter;
            status.textContent = '';
            updateList();
        });
    }

    for (const card of cards) {
        card.querySelector('.task-open').addEventListener('click', () => {
            selected = card;
            const progress = card.querySelector('progress').value;
            title.textContent = card.querySelector('h2').textContent;
            info.textContent = card.querySelector('.task-state span').textContent + ' / ' + progress + '% complete';
            form.hidden = card.dataset.taskState !== 'active';
            input.value = progress;
            dialog.showModal();
        });
    }

    form.addEventListener('submit', event => {
        event.preventDefault();
        if (selected?.dataset.taskState !== 'active') return;
        const progress = input.valueAsNumber;
        if (!Number.isInteger(progress) || progress < 0 || progress > 100) return;

        selected.querySelector('progress').value = progress;
        selected.querySelector('.task-progress span').textContent = progress + '%';
        if (progress === 100) {
            selected.dataset.taskState = 'completed';
            selected.querySelector('.task-state span').textContent = 'Completed';
            selected.querySelector('.task-state use').setAttribute('href', '#task-check');
            selected.querySelector('.task-open').firstChild.textContent = 'View Details ';
        }
        status.textContent = title.textContent + ' updated to ' + progress + '% in this preview.';
        dialog.close();
        updateTotals();
        updateList();
        if (selected.hidden) filters.find(button => button.dataset.taskFilter === filter).focus();
    });
})();
