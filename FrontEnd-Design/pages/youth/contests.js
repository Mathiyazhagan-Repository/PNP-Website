const contestDialog = document.querySelector(".contest-dialog");
const contestDialogTitle = document.getElementById("contest-dialog-title");

document.querySelectorAll(".contest-card button").forEach((button) => {
    button.addEventListener("click", () => {
        const title = button.closest("article").querySelector("h2");
        contestDialogTitle.textContent = title.innerText.replace(/\s+/g, " ").trim();
        contestDialog.showModal();
    });
});
