const photoGrid = document.getElementById("photo-grid");
const photoCards = [...photoGrid.children];
const photoControls = Object.fromEntries(["search", "sort", "category", "district", "date", "album"].map((key) => [key, document.getElementById("photo-" + key)]));
const categoryButtons = [...document.querySelectorAll("[data-photo-category]")];
const photoPreview = document.querySelector(".photo-preview");
const previewImage = document.getElementById("photo-preview-image");
const previewTitle = document.getElementById("photo-preview-title");
const previewMeta = document.getElementById("photo-preview-meta");
const previewIndex = document.getElementById("photo-preview-index");
const shareStatus = document.getElementById("photo-share-status");
const formatDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
let currentPhoto = photoCards[0];
let visiblePhotos = photoCards;

function showPhoto(card) {
    if (!card) return;
    currentPhoto = card;
    previewImage.src = card.querySelector("img").src;
    previewTitle.textContent = card.querySelector("strong").textContent;
    const { date, district, album } = card.dataset;
    document.getElementById("photo-album-action").lastChild.textContent = album === "People Connect" ? " View Full Album" : " View Album Photos";
    previewMeta.textContent = `${formatDate.format(new Date(date))} · ${district} · Album: ${album}`;
    previewIndex.textContent = `${visiblePhotos.indexOf(card) + 1} / ${visiblePhotos.length}`;
    shareStatus.textContent = "";
}

function filterPhotos() {
    const query = photoControls.search.value.trim().toLowerCase();
    const sorted = [...photoCards].sort((a, b) => {
        if (photoControls.sort.value === "name") return a.querySelector("strong").textContent.localeCompare(b.querySelector("strong").textContent);
        const difference = a.dataset.date.localeCompare(b.dataset.date);
        return photoControls.sort.value === "oldest" ? difference : -difference;
    });

    visiblePhotos = sorted.filter((card) => {
        const searchable = [card.textContent, card.dataset.album, card.dataset.category].join(" ").toLowerCase();
        return searchable.includes(query) && ["category", "district", "date", "album"].every((key) => !photoControls[key].value || card.dataset[key] === photoControls[key].value);
    });
    for (const card of sorted) {
        card.hidden = !visiblePhotos.includes(card);
        photoGrid.append(card);
    }
    for (const button of categoryButtons) {
        button.setAttribute("aria-pressed", String(button.dataset.photoCategory === photoControls.category.value));
    }
    document.getElementById("photo-empty").hidden = visiblePhotos.length > 0;
    document.getElementById("photo-count").textContent = `Showing ${visiblePhotos.length} of ${photoCards.length} sample photos`;
    if (!visiblePhotos.length && photoPreview.open) photoPreview.close();
    else if (photoPreview.open) showPhoto(visiblePhotos.includes(currentPhoto) ? currentPhoto : visiblePhotos[0]);
}

for (const [key, control] of Object.entries(photoControls)) control.addEventListener(key === "search" ? "input" : "change", filterPhotos);
for (const button of categoryButtons) {
    button.addEventListener("click", () => {
        photoControls.category.value = button.dataset.photoCategory;
        filterPhotos();
    });
}
function openPhotoPreview(card) {
    showPhoto(card);
    if (!photoPreview.open) photoPreview.showModal();
}

for (const card of photoCards) card.querySelector("button").addEventListener("click", () => openPhotoPreview(card));
document.getElementById("photo-close").addEventListener("click", () => photoPreview.close());
for (const [id, offset] of [["photo-previous", -1], ["photo-next", 1]]) {
    document.getElementById(id).addEventListener("click", () => {
        const index = visiblePhotos.indexOf(currentPhoto);
        showPhoto(visiblePhotos[(index + offset + visiblePhotos.length) % visiblePhotos.length]);
    });
}
document.getElementById("photo-album-action").addEventListener("click", () => {
    if (currentPhoto.dataset.album === "People Connect") {
        window.location.assign("album-detail.html");
        return;
    }
    photoControls.search.value = "";
    for (const key of ["category", "district", "date"]) photoControls[key].value = "";
    photoControls.album.value = currentPhoto.dataset.album;
    photoPreview.close();
    filterPhotos();
});
document.getElementById("photo-share").addEventListener("click", async () => {
    const url = new URL(window.location.href);
    url.hash = currentPhoto.id;
    try {
        await navigator.clipboard.writeText(url.href);
        shareStatus.textContent = "Preview link copied.";
    } catch {
        shareStatus.textContent = url.href;
    }
});
const linkedCategory = new URLSearchParams(window.location.search).get("category");
if (linkedCategory && categoryButtons.some((button) => button.dataset.photoCategory === linkedCategory)) {
    photoControls.category.value = linkedCategory;
    filterPhotos();
}
const linkedPhoto = visiblePhotos.find((card) => `#${card.id}` === window.location.hash);
if (linkedPhoto) openPhotoPreview(linkedPhoto);
