const statusFeedback = document.getElementById("gr-status-feedback");

document.getElementById("gr-status-copy").addEventListener("click", async () => {
    const reference = document.getElementById("gr-status-reference").textContent.trim();
    try {
        await navigator.clipboard.writeText(reference);
        statusFeedback.textContent = "Sample tracking reference copied.";
    } catch {
        statusFeedback.textContent = "Select and copy the sample tracking reference manually.";
    }
});

document.getElementById("gr-status-attachment").addEventListener("click", () => {
    statusFeedback.textContent = "The attachment shown here is a sample. No file is available.";
});

document.getElementById("gr-status-download").addEventListener("click", () => {
    statusFeedback.textContent = "An acknowledgement is available only for a confirmed grievance.";
});

document.getElementById("gr-status-alerts").addEventListener("click", () => {
    statusFeedback.textContent = "Update alerts are unavailable for this sample grievance.";
});
