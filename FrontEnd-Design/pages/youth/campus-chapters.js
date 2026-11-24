const chapterForm = document.getElementById("chapter-filter-form");
const chapterSearch = document.getElementById("chapter-search");
const chapterFilters = [...chapterForm.querySelectorAll("[data-filter]")];
const chapterCards = [...document.querySelectorAll("[data-chapter]")];
const chapterMore = document.querySelector(".chapter-more");
const chapterFeedback = document.getElementById("chapter-filter-feedback");
const chapterDialog = document.querySelector(".chapter-dialog");

function applyChapterFilters(query, filters) {
    let count = 0;
    for (const card of chapterCards) {
        const name = card.querySelector("h2, h3").textContent.toLowerCase();
        const matches = name.includes(query) && filters.every(([key, value]) => !value || card.dataset[key] === value);
        card.hidden = !matches;
        if (matches) count += 1;
    }
    chapterMore.hidden = chapterCards.slice(1).every((card) => card.hidden);
    chapterFeedback.textContent = count ? `Showing ${count} of ${chapterCards.length} sample chapters.` : "No sample chapters match these filters.";
}

chapterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    applyChapterFilters(chapterSearch.value.trim().toLowerCase(), chapterFilters.map((field) => [field.dataset.filter, field.value]));
});
chapterForm.addEventListener("reset", () => {
    applyChapterFilters("", []);
    chapterFeedback.textContent = "";
});
document.querySelectorAll("[data-view-chapter]").forEach((button) => {
    button.addEventListener("click", () => {
        const card = button.closest("[data-chapter]");
        document.getElementById("chapter-dialog-title").textContent = card.querySelector("h2, h3").textContent;
        document.getElementById("chapter-dialog-meta").textContent = `${card.dataset.city} · ${card.dataset.members} sample members`;
        chapterDialog.showModal();
    });
});
