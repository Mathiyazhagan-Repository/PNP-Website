const dashboard = document.querySelector(".account-dashboard");
const isDashboardPreview = location.protocol === "http:"
    && ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);
if (isDashboardPreview) {
    dashboard.classList.add("is-sample-dashboard");
    const title = document.getElementById("dashboard-title");
    title.firstChild.textContent = "Welcome, ";
    title.querySelector("em").textContent = "Ramesh Kumar!";
    const metrics = ["Active", "₹2,500", "3", "12"];
    dashboard.querySelectorAll(".dashboard-stats dd").forEach((value, index) => {
        value.textContent = metrics[index];
    });
    dashboard.querySelector(".dashboard-status").textContent = "Design preview · Sample account data";
}

const dashboardDialog = document.querySelector(".dashboard-dialog");
const dashboardDialogTitle = document.getElementById("dashboard-dialog-title");
document.querySelectorAll("[data-account-feature]").forEach((button) => {
    button.addEventListener("click", () => {
        dashboardDialogTitle.textContent = button.getAttribute("aria-label") || button.textContent.trim();
        dashboardDialog.showModal();
    });
});

document.querySelector('.dashboard-exit')?.addEventListener('click',()=>sessionStorage.removeItem('pnp-account-preview'));
