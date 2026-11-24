const ambassadorForm = document.querySelector(".ambassador-form");
const motivation = document.getElementById("ambassador-motivation");
const wordCount = document.getElementById("ambassador-word-count");
const ambassadorStatus = document.getElementById("ambassador-status");

motivation.addEventListener("input", () => {
    const words = motivation.value.trim().match(/\S+/g)?.length ?? 0;
    const error = words > 200 ? "Use 200 words or fewer." : "";
    motivation.setCustomValidity(error);
    wordCount.textContent = error || `${words} / 200 words`;
});
ambassadorForm.addEventListener("submit", (event) => {
    event.preventDefault();
    ambassadorStatus.textContent = "Online applications are currently unavailable. Your details have not been sent.";
    ambassadorStatus.focus();
});
ambassadorForm.querySelector('button[type="submit"]').disabled = false;
