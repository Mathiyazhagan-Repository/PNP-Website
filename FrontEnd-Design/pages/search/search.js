
/* ===========================================
   PNP SCREEN 02 - SEARCH RESULTS
   File: pages/search.js
=========================================== */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

  // ========================================
  // 1. TEMPORARY LOCAL SEARCH INDEX
  // ========================================
  // Only known website sections are listed.
  // No fictional news, events or leaders.
  // Replace with CMS/API results later.

  const searchData = [
    {
      title: "Praja Nishchaya Party Homepage",
      description: "Explore party information, news, events, public participation, membership and citizen services.",
      type: "page",
      language: "en",
      url: "../index.html"
    },
    {
      title: "About PNP",
      description: "Vision, ideology, history, organisation structure and downloadable party constitution.",
      type: "page",
      language: "en",
      url: "./about.html"
    },
    {
      title: "Achievements",
      description: "Dated party achievements with supporting evidence and source documents.",
      type: "page",
      language: "en",
      url: "./achievements.html"
    },
    {
      title: "Leadership Directory",
      description: "Find State, district and constituency office-bearers by name, role and district.",
      type: "page",
      language: "en",
      url: "./leadership.html"
    },
    {
      title: "Manifesto and Policy",
      description: "Explore policies for jobs, education, farmers, women, health and cities.",
      type: "page",
      language: "en",
      url: "./manifesto.html"
    },
    {
      title: "Newsroom",
      description: "Official press releases, party statements, speeches and news updates.",
      type: "page",
      language: "en",
      url: "./newsroom.html"
    },
    {
      title: "Events",
      description: "Browse the event calendar, district programmes, public events and live streams.",
      type: "page",
      language: "en",
      url: "./events.html"
    },
    {
      title: "Get Involved",
      description: "Find membership, volunteer, youth and campus participation opportunities.",
      type: "page",
      language: "en",
      url: "./get-involved.html"
    },
    {
      title: "Online Membership",
      description: "Join PNP using mobile OTP and receive a digital membership ID card.",
      type: "page",
      language: "en",
      url: "./join.html"
    },
    {
      title: "Donate",
      description: "Learn about online donations, digital receipts and recurring contributions.",
      type: "page",
      language: "en",
      url: "./donate.html"
    },
    {
      title: "Transparency Portal",
      description: "View approved financial summaries, audited accounts and public reports.",
      type: "page",
      language: "en",
      url: "./transparency.html"
    },
    {
      title: "Volunteer",
      description: "Register as a volunteer and explore campaign resources and activities.",
      type: "page",
      language: "en",
      url: "./volunteer.html"
    },
    {
      title: "Youth and Campus",
      description: "Explore campus chapters, contests, the SATYA Fellowship and ambassador programmes.",
      type: "page",
      language: "en",
      url: "./youth.html"
    },
    {
      title: "Grievance and Help",
      description: "Submit grievances, receive ticket numbers and track grievance updates.",
      type: "page",
      language: "en",
      url: "./grievance.html"
    },
    {
      title: "District Directory",
      description: "Find district and constituency pages, local leaders, offices, news and events.",
      type: "page",
      language: "en",
      url: "./districts.html"
    },
    {
      title: "Media Library",
      description: "Browse approved photographs, videos, podcasts, posters and templates.",
      type: "page",
      language: "en",
      url: "./media.html"
    },
    {
      title: "Fact Check",
      description: "Read myth-versus-fact entries supported by dated evidence and references.",
      type: "page",
      language: "en",
      url: "./fact-check.html"
    },
    {
      title: "Frequently Asked Questions",
      description: "Find sourced answers to questions about PNP, its policies and funding.",
      type: "page",
      language: "en",
      url: "./faq.html"
    },
    {
      title: "Contact Us",
      description: "Find the party hotline, WhatsApp, office addresses and enquiry form.",
      type: "page",
      language: "en",
      url: "./contact.html"
    },
    {
      title: "Privacy Policy",
      description: "Learn about personal data collection, consent, retention and user rights.",
      type: "page",
      language: "en",
      url: "./privacy-policy.html"
    },
    {
      title: "Donation and Refund Policy",
      description: "Read rules and information concerning donations and refunds.",
      type: "page",
      language: "en",
      url: "./donation-policy.html"
    },
    {
      title: "Accessibility Statement",
      description: "Information about accessibility and supported website features.",
      type: "page",
      language: "en",
      url: "./accessibility.html"
    },
    {
      title: "Grievance Officer",
      description: "Find contact and support information for the designated Grievance Officer.",
      type: "page",
      language: "en",
      url: "./grievance-officer.html"
    }
  ];

  // ========================================
  // 2. ELEMENT REFERENCES
  // ========================================

  const searchForm =
    document.getElementById("mainSearchForm");

  const searchInput =
    document.getElementById("mainSearchInput");

  const clearButton =
    document.getElementById("clearSearch");

  const languageFilter =
    document.getElementById("resultLanguage");

  const tabButtons = Array.from(
    document.querySelectorAll(".result-tab")
  );

  const resultsList =
    document.getElementById("resultsList");

  const resultsTitle =
    document.getElementById("resultsTitle");

  const searchSummary =
    document.getElementById("searchSummary");

  const resultTotal =
    document.getElementById("resultTotal");

  const noResults =
    document.getElementById("noResults");

  const emptyMessage =
    document.getElementById("emptyMessage");

  const resetButton =
    document.getElementById("resetSearch");

  const pagination =
    document.getElementById("searchPagination");

  const resultsPanel =
    document.getElementById("resultsPanel");

  // ========================================
  // 3. PAGE STATE
  // ========================================

  const params = new URLSearchParams(
    window.location.search
  );

  let currentQuery = params.get("q") || "";
  let activeType = "all";
  let activeLanguage = "all";
  let currentPage = 1;

  const pageSize = 6;

  searchInput.value = currentQuery;

  // ========================================
  // 4. HELPERS
  // ========================================

  function normalize(value) {
    return String(value)
      .toLocaleLowerCase()
      .normalize("NFKC")
      .trim();
  }

  function getTypeLabel(type) {
    const labels = {
      page: "Page",
      news: "News",
      event: "Event",
      leader: "Leader"
    };

    return labels[type] || "Page";
  }

  function getTypeIcon(type) {
    const icons = {
      page: "▤",
      news: "▣",
      event: "▦",
      leader: "♙"
    };

    return icons[type] || "▤";
  }

  function updateUrl() {
    const url = new URL(window.location.href);

    if (currentQuery.trim()) {
      url.searchParams.set("q", currentQuery.trim());
    } else {
      url.searchParams.delete("q");
    }

    window.history.replaceState({}, "", url);
  }

  // ========================================
  // 5. SEARCH MATCHING
  // ========================================

  function getQueryMatches() {
    const query = normalize(currentQuery);

    return searchData.filter(item => {
      if (!query) return true;

      const searchable = normalize(
        item.title + " " + item.description
      );

      return searchable.includes(query);
    });
  }

  function getLanguageMatches() {
    const queryMatches = getQueryMatches();

    if (activeLanguage === "all") {
      return queryMatches;
    }

    return queryMatches.filter(item => {
      return item.language === activeLanguage;
    });
  }

  function getFilteredResults() {
    const languageMatches = getLanguageMatches();

    if (activeType === "all") {
      return languageMatches;
    }

    return languageMatches.filter(item => {
      return item.type === activeType;
    });
  }

  // ========================================
  // 6. COUNT RESULTS BY TAB
  // ========================================

  function updateTabCounts() {
    const items = getLanguageMatches();

    ["all", "page", "news", "event", "leader"]
      .forEach(type => {

        const count = type === "all"
          ? items.length
          : items.filter(x => x.type === type).length;

        const element = document.querySelector(
          `[data-count="${type}"]`
        );

        if (element) {
          element.textContent = count;
        }
      });
  }

  // ========================================
  // 7. GENERATE RESULT CARD
  // ========================================

  function createResultCard(item) {

    const card = document.createElement("article");
    card.className = "search-result-card";

    const icon = document.createElement("div");
    icon.className = `result-type-icon ${item.type}`;
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = getTypeIcon(item.type);

    const content = document.createElement("div");
    content.className = "result-content";

    const meta = document.createElement("div");
    meta.className = "result-meta";

    const type = document.createElement("span");
    type.className = "result-type";
    type.textContent = getTypeLabel(item.type);

    const language = document.createElement("span");
    language.className = "result-language";
    language.textContent = "English";

    meta.append(type, language);

    const title = document.createElement("h3");
    const titleLink = document.createElement("a");
    titleLink.href = item.url;
    titleLink.textContent = item.title;
    title.appendChild(titleLink);

    const description = document.createElement("p");
    description.textContent = item.description;

    const footer = document.createElement("div");
    footer.className = "result-footer";

    const url = document.createElement("span");
    url.className = "result-url";
    url.textContent = item.url;

    const action = document.createElement("a");
    action.className = "result-action";
    action.href = item.url;
    action.textContent = "View Page →";

    // Most destination pages are still planned.
    // Prevent navigation to unfinished page files.
    const isExistingPage =
      item.url === "../index.html" ||
      item.url === "./search.html";

    if (!isExistingPage) {
      [titleLink, action].forEach(link => {
        link.addEventListener("click", event => {
          event.preventDefault();

          if (window.PNPHomepage?.showToast) {
            window.PNPHomepage.showToast(
              `${item.title} page has not been built yet.`
            );
          } else {
            const toast = document.getElementById("toast");

            if (toast) {
              toast.textContent =
                `${item.title} page has not been built yet.`;

              toast.hidden = false;

              setTimeout(() => {
                toast.hidden = true;
              }, 3500);
            }
          }
        });
      });
    }

    footer.append(url, action);

    content.append(
      meta,
      title,
      description,
      footer
    );

    card.append(icon, content);

    return card;
  }

  // ========================================
  // 8. RENDER PAGINATION
  // ========================================

  function renderPagination(totalItems) {
    pagination.replaceChildren();

    const totalPages = Math.ceil(
      totalItems / pageSize
    );

    if (totalPages <= 1) {
      pagination.hidden = true;
      return;
    }

    pagination.hidden = false;

    function addButton(label, page, disabled, current) {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "pagination-button";
      button.textContent = label;
      button.disabled = disabled;

      if (current) {
        button.classList.add("current");
        button.setAttribute("aria-current", "page");
      }

      button.addEventListener("click", () => {
        currentPage = page;
        renderResults();

        document
          .querySelector(".search-results-section")
          .scrollIntoView({
            behavior: window.matchMedia(
              "(prefers-reduced-motion: reduce)"
            ).matches ? "auto" : "smooth"
          });
      });

      pagination.appendChild(button);
    }

    addButton(
      "Previous",
      currentPage - 1,
      currentPage === 1,
      false
    );

    for (let page = 1; page <= totalPages; page++) {
      addButton(
        String(page),
        page,
        false,
        page === currentPage
      );
    }

    addButton(
      "Next",
      currentPage + 1,
      currentPage === totalPages,
      false
    );
  }

  // ========================================
  // 9. RENDER RESULTS
  // ========================================

  function renderResults() {

    updateTabCounts();

    const results = getFilteredResults();

    const totalPages = Math.max(
      1,
      Math.ceil(results.length / pageSize)
    );

    currentPage = Math.min(
      currentPage,
      totalPages
    );

    const start = (currentPage - 1) * pageSize;
    const visible = results.slice(
      start,
      start + pageSize
    );

    resultsList.replaceChildren();

    visible.forEach(item => {
      resultsList.appendChild(
        createResultCard(item)
      );
    });

    // Result count
    resultTotal.textContent =
      `${results.length} result${results.length === 1 ? "" : "s"}`;

    // Heading and summary
    if (currentQuery.trim()) {
      resultsTitle.textContent = "Search Results";

      searchSummary.textContent =
        `${results.length} matching result${results.length === 1 ? "" : "s"} for "${currentQuery.trim()}".`;
    } else {
      resultsTitle.textContent = "Explore Website Pages";

      searchSummary.textContent =
        "Browse the available prototype website directory.";
    }

    // Empty state
    const isEmpty = results.length === 0;

    noResults.hidden = !isEmpty;
    resultsPanel.hidden = isEmpty;

    if (isEmpty) {
      emptyMessage.textContent =
        activeLanguage !== "all" &&
        activeLanguage !== "en"
          ? "Approved search content for this language is not available yet."
          : "Try a different keyword or change the selected filters.";
    }

    // Pagination
    if (isEmpty) {
      pagination.hidden = true;
    } else {
      renderPagination(results.length);
    }

    // Clear input button
    clearButton.hidden =
      searchInput.value.trim().length === 0;
  }

  // ========================================
  // 10. MAIN SEARCH SUBMISSION
  // ========================================

  searchForm.addEventListener("submit", event => {
    event.preventDefault();

    currentQuery = searchInput.value.trim();
    currentPage = 1;

    updateUrl();
    renderResults();
  });

  searchInput.addEventListener("input", () => {
    clearButton.hidden =
      searchInput.value.trim().length === 0;
  });

  clearButton.addEventListener("click", () => {
    searchInput.value = "";
    currentQuery = "";
    currentPage = 1;

    updateUrl();
    renderResults();

    searchInput.focus();
  });

  // ========================================
  // 11. SEARCH CATEGORY TABS
  // ========================================

  function activateTab(button) {
    activeType = button.dataset.type;
    currentPage = 1;

    tabButtons.forEach(tab => {
      const active = tab === button;

      tab.classList.toggle("active", active);
      tab.setAttribute(
        "aria-selected",
        String(active)
      );

      tab.tabIndex = active ? 0 : -1;
    });

    renderResults();
  }

  tabButtons.forEach((button, index) => {

    button.addEventListener("click", () => {
      activateTab(button);
    });

    button.addEventListener("keydown", event => {
      if (
        event.key !== "ArrowRight" &&
        event.key !== "ArrowLeft" &&
        event.key !== "Home" &&
        event.key !== "End"
      ) {
        return;
      }

      event.preventDefault();

      let nextIndex = index;

      if (event.key === "ArrowRight") {
        nextIndex = (index + 1) % tabButtons.length;
      }

      if (event.key === "ArrowLeft") {
        nextIndex =
          (index - 1 + tabButtons.length) %
          tabButtons.length;
      }

      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") {
        nextIndex = tabButtons.length - 1;
      }

      const nextButton = tabButtons[nextIndex];

      nextButton.focus();
      activateTab(nextButton);
    });
  });

  // ========================================
  // 12. LANGUAGE FILTER
  // ========================================

  languageFilter.addEventListener("change", () => {
    activeLanguage = languageFilter.value;
    currentPage = 1;
    renderResults();
  });

  // ========================================
  // 13. RESET FILTERS
  // ========================================

  resetButton.addEventListener("click", () => {
    currentQuery = "";
    activeType = "all";
    activeLanguage = "all";
    currentPage = 1;

    searchInput.value = "";
    languageFilter.value = "all";

    updateUrl();

    activateTab(
      document.querySelector(
        '.result-tab[data-type="all"]'
      )
    );

    searchInput.focus();
  });

  // ========================================
  // 14. INITIAL PAGE LOAD
  // ========================================

  renderResults();

  console.info(
    "PNP Search Results prototype loaded. " +
    "Live multilingual CMS search is not yet connected."
  );

});
