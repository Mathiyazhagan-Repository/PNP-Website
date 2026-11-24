const grievanceForm = document.querySelector(".gr-submission-form");
const grievanceDetails = document.getElementById("gr-submission");
const grievanceFormTitle = document.getElementById("gr-form-title");
const grievanceMobile = document.getElementById("gr-mobile");
const grievanceFile = document.getElementById("gr-attachment");
const grievanceFileName = document.getElementById("gr-file-name");
const grievanceOtpPreview = document.getElementById("gr-otp");
const grievanceOtpStatus = document.getElementById("gr-otp-status");

function showGrievanceStep(section, focusTarget) {
    grievanceDetails.hidden = section !== grievanceDetails;
    grievanceOtpPreview.hidden = section !== grievanceOtpPreview;
    section.scrollIntoView({ block: "start" });
    focusTarget.focus({ preventScroll: true });
}

document.querySelector(".gr-submit").addEventListener("click", (event) => {
    event.preventDefault();
    showGrievanceStep(grievanceDetails, grievanceFormTitle);
});

if (window.location.hash === "#gr-submission") {
    showGrievanceStep(grievanceDetails, grievanceFormTitle);
}

document.querySelector(".gr-otp-actions a").addEventListener("click", (event) => {
    event.preventDefault();
    showGrievanceStep(grievanceDetails, grievanceMobile);
});

grievanceFile.addEventListener("change", () => {
    const [file] = grievanceFile.files;
    let error = "";

    if (file && !/\.(pdf|jpe?g|png)$/i.test(file.name)) {
        error = "Choose a PDF, JPG, or PNG file.";
    } else if (file && file.size > 5 * 1024 * 1024) {
        error = "Choose a file no larger than 5 MB.";
    }

    grievanceFile.setCustomValidity(error);
    grievanceFileName.textContent = error || file?.name || "";
});

grievanceForm.addEventListener("reset", () => {
    grievanceFile.setCustomValidity("");
    grievanceFileName.textContent = "";
});

grievanceForm.addEventListener("submit", (event) => {
    event.preventDefault();
    showGrievanceStep(grievanceOtpPreview, grievanceOtpStatus);
});
grievanceForm.querySelector(".gr-form-submit").disabled = false;

const grievanceOtpInputs = [...grievanceOtpPreview.querySelectorAll(".gr-otp-code input")];
const grievanceOtpConsent = document.getElementById("gr-otp-consent");
const grievanceOtpFeedback = document.getElementById("gr-otp-feedback");

document.getElementById("gr-otp-resend").addEventListener("click", () => {
    grievanceOtpFeedback.textContent = "The OTP service is unavailable. No code was sent.";
    grievanceOtpFeedback.focus();
});

document.getElementById("gr-otp-verify").addEventListener("click", () => {
    const incomplete = grievanceOtpInputs.find((input) => !/^\d$/.test(input.value));
    if (incomplete) {
        grievanceOtpFeedback.textContent = "Enter all six digits of the OTP.";
        incomplete.focus();
        return;
    }

    if (!grievanceOtpConsent.checked) {
        grievanceOtpFeedback.textContent = "Confirm your consent before verifying the OTP.";
        grievanceOtpConsent.focus();
        return;
    }

    window.location.assign(document.getElementById("gr-confirmation-preview").href);
});

function enterGrievanceCode(value, start) {
    const digits = value.replace(/\D/g, "").slice(0, grievanceOtpInputs.length - start);

    if (!digits) {
        grievanceOtpInputs[start].value = "";
        return;
    }

    [...digits].forEach((digit, index) => {
        grievanceOtpInputs[start + index].value = digit;
    });
    grievanceOtpInputs[Math.min(start + digits.length, grievanceOtpInputs.length - 1)].focus();
}

grievanceOtpInputs.forEach((input, index) => {
    input.addEventListener("focus", () => input.select());
    input.addEventListener("input", () => enterGrievanceCode(input.value, index));
    input.addEventListener("paste", (event) => {
        event.preventDefault();
        const value = event.clipboardData.getData("text");
        if (/\d/.test(value)) {
            enterGrievanceCode(value, value.replace(/\D/g, "").length === grievanceOtpInputs.length ? 0 : index);
        }
    });
    input.addEventListener("keydown", (event) => {
        if (event.key === "Backspace" && !input.value && index > 0) {
            event.preventDefault();
            const previous = grievanceOtpInputs[index - 1];
            previous.value = "";
            previous.focus();
        }
    });
});
