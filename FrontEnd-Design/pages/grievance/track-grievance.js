const trackingForm = document.querySelector(".gr-tracking-form");
const trackingReference = trackingForm.querySelector('input[type="text"]');

trackingReference.addEventListener("input", () => trackingReference.setCustomValidity(""));
trackingForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!trackingReference.value.trim()) {
        trackingReference.setCustomValidity("Enter your grievance tracking ID.");
        trackingReference.reportValidity();
        return;
    }

    window.location.assign("grievance-details.html");
});
trackingForm.addEventListener("reset", () => {
    trackingReference.setCustomValidity("");
});
trackingForm.querySelector('button[type="submit"]').disabled = false;
