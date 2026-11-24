const videoGrid = document.getElementById("video-grid");
const videoCards = [...videoGrid.children];
const videoControls = Object.fromEntries(["search", "sort", "category", "district", "duration", "date"].map((key) => [key, document.getElementById("video-" + key)]));
const videoCategories = [...document.querySelectorAll("[data-video-category]")];
const videoDialog = document.querySelector(".video-feature");
const featureThumb = document.getElementById("video-feature-play");
const featureTitle = document.getElementById("video-feature-title");
const featureMeta = document.getElementById("video-feature-meta");
const featureDescription = document.getElementById("video-feature-description");
const shareFeedback = document.getElementById("video-share-status");
let selectedVideo = "";

function applyVideoFilters() {
    const query = videoControls.search.value.trim().toLowerCase();
    const ordered = [...videoCards].sort((a, b) => {
        if (videoControls.sort.value === "name") return a.querySelector("strong").textContent.localeCompare(b.querySelector("strong").textContent);
        return (videoControls.sort.value === "oldest" ? 1 : -1) * a.dataset.date.localeCompare(b.dataset.date);
    });
    let visible = 0;
    for (const card of ordered) {
        const [minutes, seconds] = card.dataset.duration.split(":").map(Number);
        const duration = minutes * 60 + seconds;
        const band = duration < 300 ? "short" : duration <= 600 ? "medium" : "long";
        const content = [card.textContent, card.dataset.category, card.dataset.district].join(" ").toLowerCase();
        const matches = content.includes(query) && ["category", "district", "date"].every((key) => !videoControls[key].value || card.dataset[key] === videoControls[key].value)
            && (!videoControls.duration.value || videoControls.duration.value === band);
        card.hidden = !matches;
        if (matches) visible++;
        videoGrid.append(card);
    }
    for (const button of videoCategories) button.setAttribute("aria-pressed", String(button.dataset.videoCategory === videoControls.category.value));
    document.getElementById("video-empty").hidden = visible > 0;
    document.getElementById("video-count").textContent = `Showing ${visible} of ${videoCards.length} sample videos`;
}

function selectVideo(card) {
    selectedVideo = card.id;
    featureThumb.replaceChildren(card.querySelector(".video-thumb").cloneNode(true));
    featureTitle.textContent = card.querySelector("strong").textContent;
    featureMeta.textContent = card.querySelector(".video-card-info small").textContent.trim();
    featureDescription.textContent = `${card.dataset.category} · ${card.dataset.district}`;
    shareFeedback.textContent = "";
}

function watchSelectedVideo() {
    if (selectedVideo === "meeting") {
        window.location.assign("video-detail.html");
        return;
    }
    shareFeedback.textContent = "A published video is required for playback.";
}

function openVideoPreview(card) {
    selectVideo(card);
    if (!videoDialog.open) videoDialog.showModal();
}

for (const [key, input] of Object.entries(videoControls)) input.addEventListener(key === "search" ? "input" : "change", applyVideoFilters);
for (const button of videoCategories) button.addEventListener("click", () => {
    videoControls.category.value = button.dataset.videoCategory;
    applyVideoFilters();
});
for (const card of videoCards) card.querySelector("button").addEventListener("click", () => openVideoPreview(card));
featureThumb.addEventListener("click", watchSelectedVideo);
document.getElementById("video-watch").addEventListener("click", watchSelectedVideo);
document.getElementById("video-share").addEventListener("click", async () => {
    const url = new URL(window.location.href);
    url.hash = selectedVideo;
    try {
        await navigator.clipboard.writeText(url.href);
        shareFeedback.textContent = "Preview link copied.";
    } catch {
        shareFeedback.textContent = url.href;
    }
});
const linkedVideo = videoCards.find((card) => `#${card.id}` === window.location.hash);
if (linkedVideo) openVideoPreview(linkedVideo);
