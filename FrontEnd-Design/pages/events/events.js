(() => {
    'use strict';
    const grid = document.querySelector('.events-grid');
    if (!grid) return;
    const filter = grid.querySelector('.events-filter');
    const calendar = grid.querySelector('.events-calendar');
    const monthLabel = calendar.querySelector('h2');
    const monthSummary = calendar.querySelector('.events-calendar-summary');
    const days = grid.querySelector('#events-days');
    const cards = [...grid.querySelectorAll('.events-card')];
    const results = grid.querySelector('.events-results');
    const empty = grid.querySelector('.events-empty');
    const viewButtons = [...grid.querySelectorAll('[data-view]')];
    const controls = document.getElementById('eventRotationControls');
    const pause = document.getElementById('eventRotationPause');
    const counter = document.getElementById('eventRotationCount');
    const map = grid.querySelector('.events-map');
    const markers = document.getElementById('eventsLocationMarkers');
    const mapCurrent = document.getElementById('eventsMapCurrent');
    const monthFormat = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' });
    const dayFormat = new Intl.DateTimeFormat('en-IN', { dateStyle: 'full' });
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Approximate city centres, never venue-level coordinates.
    const cities = { Bengaluru: { lat:12.9716, lon:77.5946 }, Mysuru: { lat:12.2958, lon:76.6394 } };
    let month = new Date(2026, 10, 1), appliedFilters = new FormData(filter);
    let matching = [], monthCards = [], activeIndex = 0, paused = reducedMotion.matches, inView = true;
    const ns = 'http://www.w3.org/2000/svg';
    function monthKey() { return `${month.getFullYear()}-${String(month.getMonth()+1).padStart(2,'0')}`; }
    function updateMap(active) {
        if (!markers) return;
        markers.replaceChildren();
        const available = calendar.hidden ? matching : monthCards;
        const districts = [...new Set(available.map(card => card.dataset.district))];
        districts.forEach(district => {
            const city = cities[district]; if (!city) return;
            const x = 19.3 + (city.lon - 74.057357788086) / (78.57746887207026 - 74.057357788086) * 104;
            const y = 11.1 + (18.455120086669922 - city.lat) / (18.455120086669922 - 11.574480056762695) * 165.1;
            const selected = active?.dataset.district === district;
            const group = document.createElementNS(ns, 'g');
            group.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
            group.classList.add('events-city-marker');
            if (selected) group.classList.add('is-active');
            group.innerHTML = `<title>${district}${selected ? ', current event' : ''}</title><circle class="events-pin-halo" cy="-9" r="10" fill="none" stroke="${selected ? '#c50054' : '#2072aa'}" stroke-width="1"/><path d="M0 0C-3-4-6-7-6-11a6 6 0 1 1 12 0C6-7 3-4 0 0Z" fill="${selected ? '#c50054' : '#3986b9'}" stroke="#fff" stroke-width="1.2"/><circle cy="-11" r="2" fill="#fff"/>`;
            markers.append(group);
        });
        const district = active?.dataset.district;
        mapCurrent.textContent = district ? `${district}, Karnataka` : 'No events this month';
        map.classList.toggle('events-map-unavailable', !district);
        if (district && cities[district]) {
            map.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(district+', Karnataka')}`;
            map.setAttribute('aria-label', `View ${district}, Karnataka on Google Maps. ${districts.join(' and ')} event locations shown.`);
            map.removeAttribute('aria-disabled');
        } else {
            map.removeAttribute('href'); map.setAttribute('aria-disabled','true'); map.setAttribute('aria-label','No event location available');
        }
    }
    function showActive(animate = false) {
        const active = monthCards[activeIndex];
        cards.forEach(card => { card.hidden = calendar.hidden ? !matching.includes(card) : card !== active; });
        empty.hidden = calendar.hidden ? matching.length > 0 : monthCards.length > 0;
        if (controls) controls.hidden = calendar.hidden || monthCards.length < 2;
        if (counter) counter.textContent = `${activeIndex + 1} / ${monthCards.length}`;
        if (pause) { pause.textContent = paused ? '▶' : 'Ⅱ'; pause.setAttribute('aria-pressed',String(paused)); pause.setAttribute('aria-label',paused ? 'Play event rotation' : 'Pause event rotation'); }
        days.querySelectorAll('button[data-date]').forEach(cell => cell.setAttribute('aria-pressed',String(cell.dataset.date === active?.dataset.date)));
        updateMap(calendar.hidden ? matching[0] : active);
        if (animate && active && !reducedMotion.matches && active.animate) active.animate([{opacity:.25,transform:'translateX(12px)'},{opacity:1,transform:'translateX(0)'}],{duration:450,easing:'cubic-bezier(.16,1,.3,1)'});
    }
    function render(startDate = '') {
        matching = cards.filter(({dataset}) => (!appliedFilters.get('district') || dataset.district === appliedFilters.get('district')) && (!appliedFilters.get('type') || dataset.type === appliedFilters.get('type')));
        monthCards = matching.filter(card => card.dataset.date.startsWith(monthKey())).sort((a,b) => a.dataset.date.localeCompare(b.dataset.date));
        activeIndex = Math.max(0, monthCards.findIndex(card => card.dataset.date === startDate));
        const eventDates = new Set(monthCards.map(card => card.dataset.date));
        monthLabel.textContent = monthFormat.format(month);
        monthSummary.textContent = `${monthCards.length} ${monthCards.length === 1 ? 'event' : 'events'} this month`;
        days.replaceChildren();
        for (let i=0;i<month.getDay();i++) days.append(document.createElement('span'));
        for (let day=1;day<=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();day++) {
            const date = `${monthKey()}-${String(day).padStart(2,'0')}`;
            const cell = document.createElement(eventDates.has(date) ? 'button' : 'span');
            cell.className = 'events-day'; cell.textContent = day;
            if (eventDates.has(date)) {
                cell.type='button';cell.dataset.date=date;
                cell.setAttribute('aria-label',`Events on ${dayFormat.format(new Date(month.getFullYear(),month.getMonth(),day))}`);
                cell.addEventListener('click',()=>{activeIndex=monthCards.findIndex(card=>card.dataset.date===date);showActive(true);});
            }
            days.append(cell);
        }
        showActive();
    }
    filter.addEventListener('submit',event=>{event.preventDefault();appliedFilters=new FormData(filter);render();});
    calendar.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>{month=new Date(month.getFullYear(),month.getMonth()+Number(button.dataset.step),1);render();}));
    viewButtons.forEach(button=>button.addEventListener('click',()=>{const listView=button.dataset.view==='list';calendar.hidden=listView;grid.classList.toggle('is-list',listView);viewButtons.forEach(control=>control.setAttribute('aria-pressed',String(control===button)));render();}));
    controls?.querySelectorAll('[data-event-step]').forEach(button=>button.addEventListener('click',()=>{activeIndex=(activeIndex+Number(button.dataset.eventStep)+monthCards.length)%monthCards.length;showActive(true);}));
    pause?.addEventListener('click',()=>{paused=!paused;showActive();});
    reducedMotion.addEventListener('change',()=>{paused=reducedMotion.matches;showActive();});
    if (window.IntersectionObserver) new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;},{threshold:.1}).observe(results);
    setInterval(()=>{if(paused||!inView||document.hidden||calendar.hidden||monthCards.length<2||results.matches(':hover')||results.contains(document.activeElement))return;activeIndex=(activeIndex+1)%monthCards.length;showActive(true);},4500);
    render('2026-11-12');
})();
