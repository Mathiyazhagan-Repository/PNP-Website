const fellowshipHighlights = document.querySelector(".fellowship-highlights");
const fellowshipApplication = document.getElementById("fellowship-application");
const fellowshipTitle = document.getElementById("fellowship-application-title");
const fellowshipResume = document.getElementById("fellowship-resume");
const fellowshipResumeStatus = document.getElementById("fellowship-resume-status");
const fellowshipStatus = document.getElementById("fellowship-application-status");

document.querySelectorAll("[data-fellowship-apply]").forEach((button) => {
    button.setAttribute("aria-controls", fellowshipApplication.id);
    button.addEventListener("click", () => {
        fellowshipHighlights.hidden = true;
        fellowshipApplication.hidden = false;
        fellowshipTitle.focus();
    });
});

fellowshipResume.addEventListener("change", () => {
    const [file] = fellowshipResume.files;
    let error = "";
    if (file && (!/\.pdf$/i.test(file.name) || (file.type && file.type !== "application/pdf"))) {
        error = "Choose a PDF résumé.";
    } else if (file && file.size > 5 * 1024 * 1024) {
        error = "Choose a PDF no larger than 5 MB.";
    }
    fellowshipResume.setCustomValidity(error);
    fellowshipResumeStatus.textContent = error || file?.name || "";
});

fellowshipApplication.addEventListener("submit", (event) => {
    event.preventDefault();
    fellowshipStatus.textContent = "Online applications are currently unavailable. Your details and résumé have not been sent.";
    fellowshipStatus.focus();
});
