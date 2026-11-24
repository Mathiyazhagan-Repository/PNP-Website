const programmeDialog = document.querySelector(".youth-programme-dialog");

document.querySelectorAll("[data-programme-action]").forEach((button) => {
    button.addEventListener("click", () => {
        const card = button.closest("article");
        programmeDialog.querySelector("h2").textContent = card.querySelector("h2").textContent;
        programmeDialog.querySelector(".youth-programme-description").textContent = card.querySelector("p").textContent;
        programmeDialog.showModal();
    });
});
