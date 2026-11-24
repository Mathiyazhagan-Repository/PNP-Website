const hubForm = document.getElementById("hub-search-form");
const hubResults = document.getElementById("hub-search-results");
const hubList = document.getElementById("hub-results-list");
const hubCount = document.getElementById("hub-results-count");
const hubItems = [...document.querySelectorAll("[data-hub-item]")];
const hubControls = Object.fromEntries(["query", "category", "kind", "district", "year"].map((key) => [key, document.getElementById("hub-" + key)]));

hubForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = hubControls.query.value.trim().toLowerCase();
    const matches = hubItems.filter(({ dataset }) => {
        const searchable = [dataset.title, dataset.category, dataset.district].join(" ").toLowerCase();
        return searchable.includes(query) && ["category", "kind", "district", "year"].every((key) => !hubControls[key].value || hubControls[key].value === dataset[key]);
    });
    hubList.replaceChildren(...matches.map((item) => {
        const row = document.createElement("li");
        const link = document.createElement("a");
        link.href = item.href;
        link.textContent = item.dataset.title;
        row.append(link);
        return row;
    }));
    hubResults.hidden = false;
    hubCount.textContent = matches.length ? `${matches.length} matching previews` : "No media matches the selected filters.";
    hubResults.scrollIntoView({ block: "nearest" });
});
document.getElementById("hub-clear-search").addEventListener("click", () => {
    hubForm.reset();
    hubResults.hidden = true;
    hubControls.query.focus();
});
