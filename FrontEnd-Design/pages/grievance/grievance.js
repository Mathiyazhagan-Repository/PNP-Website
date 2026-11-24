function revealGrievanceSection() {
    const section = document.getElementById(window.location.hash.slice(1));

    if (section instanceof HTMLDetailsElement) {
        section.open = true;
    }
}

document.querySelectorAll(".gr-actions a").forEach((action) => {
    action.addEventListener("click", () => {
        const section = document.getElementById(action.hash.slice(1));

        if (section instanceof HTMLDetailsElement) {
            section.open = true;
            section.querySelector("summary").focus({ preventScroll: true });
        }
    });
});

window.addEventListener("hashchange", revealGrievanceSection);
revealGrievanceSection();
