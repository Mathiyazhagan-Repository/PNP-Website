const hackathonForm = document.querySelector(".hackathon-form");
hackathonForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const feedback = document.getElementById("hackathon-feedback");
    feedback.textContent = "Online registration is unavailable. Your details have not been sent.";
    feedback.focus();
});
hackathonForm.querySelector('button[type="submit"]').disabled = false;
