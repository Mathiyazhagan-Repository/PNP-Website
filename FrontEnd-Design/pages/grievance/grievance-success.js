const receiptReference = document.getElementById("gr-receipt-number");
const receiptDate = document.getElementById("gr-receipt-date");
const receiptCopy = document.getElementById("gr-copy-reference");
const receiptFeedback = document.getElementById("gr-copy-feedback");
const receiptPreview = document.getElementById("gr-receipt-preview");
const serverReference = receiptReference.textContent.trim();
const hasConfirmedReceipt = serverReference !== "" && serverReference !== "—"
    && Number.isFinite(Date.parse(receiptDate.dateTime));
const isDesignPreview = !hasConfirmedReceipt;

if (isDesignPreview) {
    receiptReference.textContent = "PNP-GRV-2026-000458";
    receiptDate.textContent = "15 Apr 2026, 11:24 AM";
    receiptDate.dateTime = "2026-04-15T11:24:00+05:30";
    receiptPreview.hidden = false;
}

const reference = receiptReference.textContent.trim();
if (reference && reference !== "—" && Number.isFinite(Date.parse(receiptDate.dateTime))) {
    document.querySelector(".gr-confirmation").setAttribute("data-confirmed", "");
    document.getElementById("gr-confirmation-headline").firstChild.textContent = "Grievance Submitted ";
    document.querySelector("#gr-confirmation-headline strong").textContent = "Successfully!";
    document.getElementById("gr-confirmation-copy").textContent = "Your grievance has been received. Track its status using your reference number.";
    document.getElementById("gr-confirmation-status").textContent = "Your Grievance Has Been Submitted Successfully!";
    const message = document.getElementById("gr-confirmation-message");
    message.replaceChildren(
        "Thank you for reaching out to Praja Nishchaya Party (PNP).",
        document.createElement("br"),
        "Your grievance has been received and a reference number has been generated for tracking."
    );
    document.querySelector("#gr-confirmation-icon path").setAttribute("d", "m5 12 4 4L19 6");
    receiptCopy.disabled = false;
    receiptCopy.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(reference);
            receiptFeedback.textContent = isDesignPreview ? "Sample reference copied." : "Tracking reference copied.";
        } catch {
            receiptFeedback.textContent = "Select and copy the tracking reference manually.";
        }
    });
}
