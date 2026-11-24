const detailDialog = document.querySelector(".video-detail-dialog");
const detailFeedback = document.getElementById("video-detail-feedback");
const dialogImage = detailDialog.querySelector("img");

function showVideoDetailPreview(showPoster) {
    dialogImage.hidden = !showPoster;
    detailDialog.showModal();
}

document.querySelectorAll("[data-video-detail-play]").forEach((button) => {
    button.addEventListener("click", () => showVideoDetailPreview(false));
});
document.getElementById("video-detail-expand").addEventListener("click", () => showVideoDetailPreview(true));

for (const [id, initial, active, message] of [
    ["video-detail-like", "Like (2.4K)", "Liked", "Like selected for this preview."],
    ["video-detail-save", "Save", "Saved", "Save selected for this preview."]
]) {
    const button = document.getElementById(id);
    button.addEventListener("click", () => {
        const pressed = button.getAttribute("aria-pressed") !== "true";
        button.setAttribute("aria-pressed", String(pressed));
        button.querySelector("span").textContent = pressed ? active : initial;
        detailFeedback.textContent = pressed ? message : "";
    });
}
document.getElementById("video-detail-share").addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(window.location.href);
        detailFeedback.textContent = "Video preview link copied.";
    } catch {
        detailFeedback.textContent = window.location.href;
    }
});
