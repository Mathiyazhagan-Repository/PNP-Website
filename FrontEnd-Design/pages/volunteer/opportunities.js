const pnpVolunteerOpportunities = new Map([
    ['clean', 'Clean Karnataka Drive'],
    ['outreach', 'Public Outreach Program'],
    ['media', 'Content & Media Support'],
    ['events', 'Event Management']
]);

(() => {
    const form = document.querySelector('#opportunities-filters');
    if (!form) return;

    const cards = [...document.querySelectorAll('.opportunities-grid article')];
    const status = document.querySelector('#opportunities-status');
    const empty = document.querySelector('#opportunities-empty');

    function filter() {
        const values = new FormData(form);
        for (const card of cards) {
            card.hidden = ['category', 'district', 'mode'].some(key => {
                const value = values.get(key);
                return value && card.dataset[key] !== value;
            });
        }
        const count = cards.filter(card => !card.hidden).length;
        status.textContent = 'Showing ' + count + ' preview ' + (count === 1 ? 'opportunity' : 'opportunities');
        empty.hidden = count !== 0;
    }

    form.addEventListener('submit', event => {
        event.preventDefault();
        filter();
    });
    document.querySelector('#opportunities-reset').addEventListener('click', () => {
        form.reset();
        filter();
        form.elements.category.focus();
    });
})();
