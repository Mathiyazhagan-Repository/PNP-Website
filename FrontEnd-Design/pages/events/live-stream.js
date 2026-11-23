(() => {
    const player = document.querySelector('#live-player');
    const status = document.querySelector('#live-status');
    const like = document.querySelector('#live-like');
    const message = document.querySelector('#live-message');
    const messages = document.querySelector('#live-messages');
    const shareFallback = document.querySelector('#live-share-fallback');

    for (const button of document.querySelectorAll('[data-live-play]')) {
        button.addEventListener('click', () => {
            status.textContent = 'This is a local stream preview.';
        });
    }

    document.querySelector('#live-fullscreen').addEventListener('click', async () => {
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            } else {
                await player.requestFullscreen();
            }
        } catch {
            status.textContent = 'Fullscreen is unavailable in this browser.';
        }
    });

    like.addEventListener('click', () => {
        const active = like.getAttribute('aria-pressed') === 'true';
        like.setAttribute('aria-pressed', String(!active));
        like.lastChild.textContent = active ? 'Like' : 'Liked';
    });

    document.querySelector('#live-comment').addEventListener('click', () => message.focus());

    document.querySelector('#live-share').addEventListener('click', async () => {
        const url = window.location.href;
        if (window.location.protocol !== 'file:') {
            try {
                if (navigator.share) {
                    await navigator.share({ title: document.title, url });
                    return;
                }
                await navigator.clipboard.writeText(url);
                status.textContent = 'Link copied.';
                return;
            } catch (error) {
                if (error.name === 'AbortError') return;
            }
        }

        const shareUrl = document.querySelector('#live-share-url');
        shareFallback.hidden = false;
        shareUrl.value = url;
        shareUrl.select();
    });

    document.querySelector('#live-chat-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const text = message.value.trim();
        if (!text) return;

        const item = document.createElement('li');
        const avatar = document.createElement('span');
        avatar.className = 'live-avatar';
        avatar.setAttribute('aria-hidden', 'true');
        avatar.textContent = 'You';
        const body = document.createElement('p');
        body.textContent = text;
        item.append(avatar, body);
        messages.append(item);
        messages.scrollTop = messages.scrollHeight;
        message.value = '';
        message.focus();
    });
})();
