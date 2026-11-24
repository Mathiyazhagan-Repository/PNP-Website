const resourceCategories = {
    training: ["Training Resources", "Youth training guides and toolkits will appear here when published."],
    policy: ["Policy Explainers", "Youth policy explainers will appear here when published."],
    campus: ["Campus Initiatives", "Campus initiative guides will appear here when published."],
    downloads: ["Downloadable Materials", "No youth materials are currently available to download."],
    videos: ["Videos & Webinars", "No youth videos or webinars are currently listed."],
    all: ["Resource Library", "The youth resource library is awaiting its first published materials."]
};
const resourceDialog = document.querySelector(".resources-dialog");
const resourceTitle = document.getElementById("resources-dialog-title");
const resourceMessage = document.getElementById("resources-dialog-message");
const relatedResources = resourceDialog.querySelectorAll("[data-related]");

document.querySelectorAll("[data-resource]").forEach((button) => {
    button.addEventListener("click", () => {
        const category = button.dataset.resource;
        const [title, message] = resourceCategories[category];
        resourceTitle.textContent = title;
        resourceMessage.textContent = message;
        relatedResources.forEach((link) => { link.hidden = link.dataset.related !== category; });
        resourceDialog.showModal();
    });
});
