const accountModes = document.querySelectorAll("[data-account-mode]");
const accountForm = document.getElementById("account-otp-form");
const accountTitle = document.getElementById("account-form-title");
const accountDescription = document.getElementById("account-form-description");
const accountStatus = document.getElementById("account-status");
const mobile = document.getElementById("account-mobile");
const verifyForm = document.getElementById("account-verify-form");
const verifyTitle = document.getElementById("account-verify-title");
const verifyStatus = document.getElementById("account-verification-status");
const code = document.getElementById("account-otp-code");
const editMobile = document.getElementById("account-edit-mobile");
const requestButton = accountForm.querySelector(".account-submit");
const verifyButton = verifyForm.querySelector(".account-submit");
const otpCells = [...document.querySelectorAll(".account-otp-cell")];
// Deployment supplies same-origin endpoints through PNPAccount. The server
// owns the OTP challenge and establishes the authenticated cookie session.
const accountConfig = window.PNPAccount || {};
const localPreview = location.protocol === "http:"
    && ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname)
    && !accountConfig.requestOtpEndpoint && !accountConfig.verifyOtpEndpoint;
const previewCode = "123456";
let mode = "login";
let challengeSent = false;

function accountEndpoint(path) {
    if (!path) return null;
    try {
        const url = new URL(path, location.href);
        const localHttp = url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
        return url.origin === location.origin && (url.protocol === "https:" || localHttp) ? url.href : null;
    } catch {
        return null;
    }
}

async function requestAccountOtp(endpoint, body) {
    const headers = { "Content-Type": "application/json", Accept: "application/json" };
    const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
    if (csrf) headers["X-CSRF-TOKEN"] = csrf;
    const response = await fetch(endpoint, {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000)
    });
    return response.ok ? response.json() : {};
}

function returnToMobile() {
    challengeSent = false;
    code.value = "";
    otpCells.forEach((cell) => { cell.value = ""; });
    verifyStatus.textContent = "";
    verifyForm.hidden = true;
    accountForm.hidden = false;
}

function showOtpCard(message) {
    accountForm.hidden = true;
    verifyForm.hidden = false;
    verifyStatus.textContent = message;
    otpCells.forEach((cell) => { cell.value = ""; });
    code.value = "";
    verifyButton.disabled = true;
    verifyTitle.focus();
}

function syncOtpCode() {
    code.value = otpCells.map((cell) => cell.value).join("");
    verifyButton.disabled = code.value.length !== otpCells.length;
}

otpCells.forEach((cell, index) => {
    cell.addEventListener("input", () => {
        cell.value = cell.value.replace(/\D/g, "").slice(-1);
        if (cell.value && index < otpCells.length - 1) otpCells[index + 1].focus();
        syncOtpCode();
    });
    cell.addEventListener("keydown", (event) => {
        if (event.key === "Backspace" && !cell.value && index > 0) {
            otpCells[index - 1].focus();
            otpCells[index - 1].value = "";
            syncOtpCode();
        }
    });
    cell.addEventListener("paste", (event) => {
        event.preventDefault();
        const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, otpCells.length);
        digits.split("").forEach((digit, digitIndex) => {
            otpCells[digitIndex].value = digit;
        });
        otpCells[Math.min(digits.length, otpCells.length - 1)].focus();
        syncOtpCode();
    });
});

accountModes.forEach((button) => button.addEventListener("click", () => {
    mode = button.dataset.accountMode;
    const signup = mode === "signup";
    accountModes.forEach((control) => control.setAttribute("aria-pressed", String(control === button)));
    returnToMobile();
    accountTitle.textContent = signup ? "Create Your Account" : "Login to Your Account";
    accountDescription.textContent = signup
        ? "Enter your mobile number to start sign-up with a one-time password (OTP)."
        : "Enter your mobile number to receive a one-time password (OTP).";
    accountStatus.textContent = "";
}));

editMobile.addEventListener("click", () => {
    returnToMobile();
    mobile.focus();
});

accountForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (localPreview) {
        showOtpCard(`Local preview: use test code ${previewCode}. No SMS was sent.`);
        return;
    }
    const endpoint = accountEndpoint(accountConfig.requestOtpEndpoint);
    if (!endpoint || !accountEndpoint(accountConfig.verifyOtpEndpoint)) {
        showOtpCard("The OTP service is currently unavailable. No code was sent.");
        return;
    }
    requestButton.disabled = true;
    accountModes.forEach((button) => { button.disabled = true; });
    accountStatus.textContent = "Requesting an OTP…";
    try {
        const result = await requestAccountOtp(endpoint, { mobile: "+91" + mobile.value, mode });
        challengeSent = result?.sent === true;
        if (challengeSent) {
            accountStatus.textContent = "";
            showOtpCard("An OTP was sent to the mobile number you entered.");
        } else {
            accountStatus.textContent = "OTP delivery could not be confirmed. Please try again.";
        }
    } catch {
        accountStatus.textContent = "Could not reach the OTP service. Please try again.";
    } finally {
        requestButton.disabled = false;
        accountModes.forEach((button) => { button.disabled = false; });
    }
});

verifyForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (localPreview && !verifyForm.hidden) {
        if (code.value === previewCode) {
            sessionStorage.setItem("pnp-account-preview", "1");
            location.assign("dashboard.html");
        } else {
            verifyStatus.textContent = `Use test code ${previewCode} to open the local dashboard preview.`;
            code.focus();
        }
        return;
    }
    const endpoint = accountEndpoint(accountConfig.verifyOtpEndpoint);
    if (!challengeSent || !endpoint) {
        verifyStatus.textContent = "The OTP service is currently unavailable. Your code was not verified.";
        return;
    }
    verifyButton.disabled = true;
    editMobile.disabled = true;
    accountModes.forEach((button) => { button.disabled = true; });
    verifyStatus.textContent = "Verifying your code…";
    try {
        const result = await requestAccountOtp(endpoint, { code: code.value });
        if (result?.authenticated === true) {
            location.assign("dashboard.html");
            return;
        }
        verifyStatus.textContent = "That code could not be verified. Check the code and try again.";
    } catch {
        verifyStatus.textContent = "Could not reach the OTP service. Please try again.";
    } finally {
        verifyButton.disabled = false;
        editMobile.disabled = false;
        accountModes.forEach((button) => { button.disabled = false; });
    }
});
requestButton.disabled = false;
verifyButton.disabled = false;
