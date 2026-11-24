const albumGrid = document.getElementById("album-grid");
const albumPhotos = [...albumGrid.children];
const albumSort = document.getElementById("album-sort");
const albumFilters = [...document.querySelectorAll("[data-album-filter]")];
const albumLayouts = [...document.querySelectorAll("[data-album-layout]")];
const lightbox = document.querySelector(".album-lightbox");
let albumCategory = "";
let albumVisible = albumPhotos;
let activePhoto;

function updateAlbum() {
    const order = [...albumPhotos];
    if (albumSort.value === "oldest") order.reverse();
    if (albumSort.value === "name") order.sort((a, b) => a.textContent.trim().localeCompare(b.textContent.trim()));
    albumVisible = order.filter((photo) => !albumCategory || photo.dataset.albumCategory === albumCategory);
    for (const photo of order) {
        photo.hidden = !albumVisible.includes(photo);
        albumGrid.append(photo);
    }
}

function showAlbumPhoto(photo) {
    activePhoto = photo;
    const name = photo.querySelector("strong").textContent;
    document.getElementById("album-lightbox-title").textContent = name;
    const image = document.getElementById("album-lightbox-image");
    image.src = photo.querySelector("img").src;
    image.alt = "Illustrative photo: " + name;
    document.getElementById("album-lightbox-count").textContent = `${albumVisible.indexOf(photo) + 1} / ${albumVisible.length}`;
}

albumFilters.forEach((button) => button.addEventListener("click", () => {
    albumCategory = button.dataset.albumFilter;
    albumFilters.forEach((filter) => filter.setAttribute("aria-pressed", String(filter === button)));
    updateAlbum();
}));
albumLayouts.forEach((button) => button.addEventListener("click", () => {
    albumGrid.classList.toggle("is-list", button.dataset.albumLayout === "list");
    albumLayouts.forEach((layout) => layout.setAttribute("aria-pressed", String(layout === button)));
}));
albumSort.addEventListener("change", updateAlbum);
albumPhotos.forEach((photo) => photo.querySelector("button").addEventListener("click", () => {
    showAlbumPhoto(photo);
    lightbox.showModal();
}));
function stepAlbumPhoto(step) {
    const index = albumVisible.indexOf(activePhoto);
    showAlbumPhoto(albumVisible[(index + step + albumVisible.length) % albumVisible.length]);
}
document.getElementById("album-prev").addEventListener("click", () => stepAlbumPhoto(-1));
document.getElementById("album-next").addEventListener("click", () => stepAlbumPhoto(1));
lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        stepAlbumPhoto(event.key === "ArrowLeft" ? -1 : 1);
    }
});
document.getElementById("album-share").addEventListener("click", async () => {
    const status = document.getElementById("album-share-status");
    try {
        await navigator.clipboard.writeText(window.location.href);
        status.textContent = "Album link copied.";
    } catch {
        status.textContent = window.location.href;
    }
});
