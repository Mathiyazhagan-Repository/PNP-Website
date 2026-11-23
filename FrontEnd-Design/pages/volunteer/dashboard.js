(() => {
    const dialog = document.querySelector('#dashboard-dialog');
    const title = document.querySelector('#dashboard-dialog-title');
    const copy = document.querySelector('#dashboard-dialog-copy');
    const link = document.querySelector('#dashboard-dialog-link');
    const panels = {
        opportunities: ['My Opportunities', '3 opportunities are shown in this preview. Browse the opportunity listings to explore available categories.'],
        notifications: ['Notifications', 'This preview shows 5 new updates. Notification details will appear when the volunteer service is connected.'],
        settings: ['Settings', 'Account preferences will be available with a connected volunteer account.'],
        profile: ['Volunteer Profile', 'Priya Nair | Volunteer ID: PNPV001567 | Active. Profile editing requires a connected volunteer account.'],
        activities: ['My Recent Activities', 'Community Awareness Drive | Bengaluru, Karnataka | 24 May 2025.']
    };

    for (const button of document.querySelectorAll('[data-dashboard-panel]')) {
        button.addEventListener('click', () => {
            const panel = button.dataset.dashboardPanel;
            const [heading, message] = panels[panel];
            title.textContent = heading;
            copy.textContent = message;
            link.hidden = panel !== 'opportunities';
            dialog.showModal();
        });
    }
})();
