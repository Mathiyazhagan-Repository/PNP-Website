function revealYouthTopic(hash) {
    const topic = document.getElementById(hash.slice(1));
    if (topic instanceof HTMLDetailsElement) topic.open = true;
}

document.querySelectorAll('.youth-landing a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => revealYouthTopic(link.hash));
});
window.addEventListener("hashchange", () => revealYouthTopic(window.location.hash));
revealYouthTopic(window.location.hash);
