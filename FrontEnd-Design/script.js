
/* ======================================================
   PRAJA NISCHAYA PARTY (PNP)
   SCREEN 01: HOMEPAGE
   FILE: script.js
   Vanilla JavaScript
====================================================== */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

  // ====================================================
  // 01. COMMON HELPERS
  // ====================================================

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  const get = (id) => document.getElementById(id);

  const toast = get("toast");
  let toastTimer;

  function showToast(message) {
    if (!toast) return;

    clearTimeout(toastTimer);

    toast.textContent = message;
    toast.hidden = false;

    toastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 4500);
  }

  // ====================================================
  // 02. MOBILE MENU
  // ====================================================

  const menuToggle = get("menuToggle");
  const mobileNav = get("mobileNav");

  function closeMobileMenu() {
    if (!menuToggle || !mobileNav) return;

    mobileNav.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    menuToggle.innerHTML = "<span aria-hidden='true'>☰</span>";
  }

  function openMobileMenu() {
    if (!menuToggle || !mobileNav) return;

    mobileNav.hidden = false;
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close navigation");
    menuToggle.innerHTML = "<span aria-hidden='true'>✕</span>";
  }

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => {
      if (mobileNav.hidden) {
        openMobileMenu();
      } else {
        closeMobileMenu();
      }
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 1250) {
        closeMobileMenu();
      }
    });
  }

  // ====================================================
  // 03. MORE DROPDOWN
  // ====================================================

  const moreToggle = get("moreDropdownToggle");
  const moreDropdown = get("moreDropdown");

  function closeMoreDropdown() {
    if (!moreToggle || !moreDropdown) return;

    moreDropdown.hidden = true;
    moreToggle.setAttribute("aria-expanded", "false");
  }

  if (moreToggle && moreDropdown) {
    moreToggle.addEventListener("click", (event) => {
      event.stopPropagation();

      const willOpen = moreDropdown.hidden;

      moreDropdown.hidden = !willOpen;
      moreToggle.setAttribute(
        "aria-expanded",
        String(willOpen)
      );
    });

    document.addEventListener("click", (event) => {
      if (
        !moreDropdown.contains(event.target) &&
        !moreToggle.contains(event.target)
      ) {
        closeMoreDropdown();
      }
    });
  }

  // ====================================================
  // 04. GLOBAL SEARCH PANEL
  // ====================================================

  const searchToggle = get("searchToggle");
  const headerSearch = get("headerSearch");
  const globalSearch = get("globalSearch");

  function closeSearch() {
    if (!searchToggle || !headerSearch) return;

    headerSearch.hidden = true;
    searchToggle.setAttribute("aria-expanded", "false");
  }

  if (searchToggle && headerSearch) {
    searchToggle.addEventListener("click", () => {
      const willOpen = headerSearch.hidden;

      headerSearch.hidden = !willOpen;
      searchToggle.setAttribute(
        "aria-expanded",
        String(willOpen)
      );

      if (willOpen && globalSearch) {
        globalSearch.focus();
      }
    });
  }

  // Search form uses native GET navigation:
  // pages/search.html?q=keyword
  // Actual multilingual search will be implemented
  // on Screen 02 after the search page is created.

  // ====================================================
  // 05. HERO BANNER CAROUSEL
  // ====================================================

  const heroSlides = Array.from(
    $$(".hero-slide")
  );

  const heroDots = Array.from(
    $$(".hero-dot")
  );

  const prevSlideButton = get("prevSlide");
  const nextSlideButton = get("nextSlide");
  const pauseSlideButton = get("pauseSlide");
  const heroCarousel = get("heroCarousel");

  let activeSlide = 0;
  let sliderPaused = false;
  let sliderTimer = null;

  const slideDelay = 6500;

  function showSlide(index) {
    if (!heroSlides.length) return;

    activeSlide =
      (index + heroSlides.length) % heroSlides.length;

    heroSlides.forEach((slide, i) => {
      const isActive = i === activeSlide;

      slide.hidden = !isActive;
      slide.classList.toggle("active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    heroDots.forEach((dot, i) => {
      const isActive = i === activeSlide;

      dot.classList.toggle("active", isActive);

      if (isActive) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });
  }

  function nextSlide() {
    showSlide(activeSlide + 1);
  }

  function previousSlide() {
    showSlide(activeSlide - 1);
  }

  function stopSlider() {
    if (sliderTimer !== null) {
      clearInterval(sliderTimer);
      sliderTimer = null;
    }
  }

  function startSlider() {
    stopSlider();

    if (
      sliderPaused ||
      document.hidden ||
      heroSlides.length < 2
    ) {
      return;
    }

    sliderTimer = setInterval(() => {
      nextSlide();
    }, slideDelay);
  }

  function updatePauseButton() {
    if (!pauseSlideButton) return;

    pauseSlideButton.textContent =
      sliderPaused ? "Play" : "Pause";

    pauseSlideButton.setAttribute(
      "aria-label",
      sliderPaused
        ? "Play banner rotation"
        : "Pause banner rotation"
    );

    pauseSlideButton.setAttribute(
      "aria-pressed",
      String(sliderPaused)
    );
  }

  if (heroSlides.length) {
    showSlide(0);

    if (prevSlideButton) {
      prevSlideButton.addEventListener("click", () => {
        previousSlide();
        startSlider();
      });
    }

    if (nextSlideButton) {
      nextSlideButton.addEventListener("click", () => {
        nextSlide();
        startSlider();
      });
    }

    heroDots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        showSlide(index);
        startSlider();
      });
    });

    const prefersReducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    sliderPaused = prefersReducedMotion;

    updatePauseButton();

    if (pauseSlideButton) {
      pauseSlideButton.addEventListener("click", () => {
        sliderPaused = !sliderPaused;
        updatePauseButton();
        startSlider();
      });
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopSlider();
      } else {
        startSlider();
      }
    });

    // Pause while the carousel has keyboard focus.
    if (heroCarousel) {
      heroCarousel.addEventListener("focusin", stopSlider);

      heroCarousel.addEventListener("focusout", (event) => {
        if (!heroCarousel.contains(event.relatedTarget)) {
          startSlider();
        }
      });
    }

    startSlider();
  }

  // ====================================================
  // 06. LANGUAGE SWITCHER
  // ====================================================

  // Language selection is managed globally by languages.js.

  // ====================================================
  // 07. DISTRICT SELECTOR
  // ====================================================

  const districtForm = get("districtForm");
  const districtSelect = get("districtSelect");

  if (districtForm && districtSelect) {
    const districtExamples = {
      "bengaluru-urban": ["Ananya Rao", "Bengaluru", 12],
      "bengaluru-rural": ["Vikram Gowda", "Devanahalli", 6],
      "mysuru": ["Kavya Prasad", "Mysuru", 8],
      "mandya": ["Arun Kumar", "Mandya", 5],
      "tumakuru": ["Meera Shankar", "Tumakuru", 7],
      "hassan": ["Ravi Shetty", "Hassan", 4],
      "mangaluru": ["Divya Rai", "Mangaluru", 6],
      "belagavi": ["Sanjay Patil", "Belagavi", 8],
      "dharwad": ["Nandini Desai", "Dharwad", 5],
      "kalaburagi": ["Ajay Kulkarni", "Kalaburagi", 4]
    };
    districtForm.addEventListener("submit", event => {
      event.preventDefault();
      const details = districtExamples[districtSelect.value];
      const result = get("districtResult");
      if (!details || !result) return;
      const district = districtSelect.selectedOptions[0].textContent;
      result.replaceChildren();
      const title = document.createElement("h3");
      title.textContent = district + " District Unit";
      const summary = document.createElement("p");
      summary.textContent = "District coordinator: " + details[0] + " ? Local office: " + details[1] + " ? " + details[2] + " community programmes";
      result.append(title, summary);
      result.hidden = false;
    });
  }

  // ====================================================
  // 08. LOGIN / SIGN UP MODAL
  // ====================================================

  const loginModal = get("loginModal");
  const loginOpen = get("loginOpen");
  const mobileLoginOpen = get("mobileLoginOpen");
  const loginClose = get("loginClose");

  const loginMobileForm = get("loginMobileForm");
  const loginOtpForm = get("loginOtpForm");

  const loginMobile = get("loginMobile");
  const loginOtp = get("loginOtp");
  const resendOtp = get("resendOtp");

  let activeModal = null;
  let previousFocus = null;

  function openModal(modal) {
    if (!modal) return;

    previousFocus = document.activeElement;

    if (activeModal && activeModal !== modal) {
      activeModal.hidden = true;
    }

    activeModal = modal;
    modal.hidden = false;
    document.body.classList.add("modal-open");

    const focusTarget = modal.querySelector(
      "input:not(:disabled), button:not(:disabled)"
    );

    if (focusTarget) {
      focusTarget.focus();
    }
  }

  function closeModal(modal) {
    if (!modal) return;

    modal.hidden = true;

    if (activeModal === modal) {
      activeModal = null;
    }

    document.body.classList.remove("modal-open");

    if (
      previousFocus &&
      typeof previousFocus.focus === "function"
    ) {
      previousFocus.focus();
    }
  }

  function resetLoginForm() {
    if (loginMobileForm) {
      loginMobileForm.hidden = false;
      loginMobileForm.reset();
    }

    if (loginOtpForm) {
      loginOtpForm.hidden = true;
      loginOtpForm.reset();
    }

    if (resendOtp) {
      resendOtp.disabled = true;
    }
  }

  function openLogin() {
    resetLoginForm();
    closeMobileMenu();
    openModal(loginModal);
  }

  if (loginOpen) {
    loginOpen.addEventListener("click", openLogin);
  }

  if (mobileLoginOpen) {
    mobileLoginOpen.addEventListener("click", openLogin);
  }

  if (loginClose) {
    loginClose.addEventListener("click", () => {
      closeModal(loginModal);
    });
  }

  // Login is not connected to a real OTP provider.
  // Never fake a sent OTP or authenticated session.

  if (loginMobileForm) {
    loginMobileForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!loginMobile.checkValidity()) {
        loginMobile.reportValidity();
        return;
      }

      showToast(
        "OTP login is not connected yet. SMS verification will be enabled after backend integration."
      );
    });
  }

  if (loginOtpForm) {
    loginOtpForm.addEventListener("submit", (event) => {
      event.preventDefault();

      showToast(
        "OTP verification requires the secure authentication backend."
      );
    });
  }

  if (resendOtp) {
    resendOtp.addEventListener("click", () => {
      showToast(
        "OTP resend requires the SMS authentication service."
      );
    });
  }

  // ====================================================
  // 09. COOKIE CONSENT MANAGEMENT
  // ====================================================

  const cookieBanner = get("cookieBanner");
  const cookieAccept = get("cookieAccept");
  const cookieReject = get("cookieReject");
  const cookieCustomize = get("cookieCustomize");

  const cookieModal = get("cookiePreferencesModal");
  const cookiePreferencesClose =
    get("cookiePreferencesClose");

  const cookiePreferencesForm =
    get("cookiePreferencesForm");

  const analyticsConsent =
    get("analyticsConsent");

  const socialConsent =
    get("socialConsent");

  const consentKey = "pnp_cookie_preferences_v1";

  function loadCookiePreferences() {
    try {
      const saved = localStorage.getItem(consentKey);

      if (!saved) return null;

      const parsed = JSON.parse(saved);

      if (
        typeof parsed.analytics === "boolean" &&
        typeof parsed.social === "boolean"
      ) {
        return parsed;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  function saveCookiePreferences(preferences) {
    const payload = {
      essential: true,
      analytics: Boolean(preferences.analytics),
      social: Boolean(preferences.social),
      updatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(
        consentKey,
        JSON.stringify(payload)
      );
    } catch (error) {
      // Storage may be disabled.
      // Consent is retained for this session.
    }

    window.pnpCookieConsent = payload;

    if (cookieBanner) {
      cookieBanner.hidden = true;
    }

    if (activeModal === cookieModal) {
      closeModal(cookieModal);
    }

    // No analytics or social scripts are loaded
    // by this standalone UI prototype.
    // Integrations must read these preferences
    // before loading optional third-party scripts.

    showToast("Your cookie preferences have been saved.");
  }

  const savedPreferences = loadCookiePreferences();

  if (savedPreferences) {
    window.pnpCookieConsent = savedPreferences;
  } else if (cookieBanner) {
    cookieBanner.hidden = false;
  }

  if (cookieAccept) {
    cookieAccept.addEventListener("click", () => {
      saveCookiePreferences({
        analytics: true,
        social: true
      });
    });
  }

  if (cookieReject) {
    cookieReject.addEventListener("click", () => {
      saveCookiePreferences({
        analytics: false,
        social: false
      });
    });
  }

  if (cookieCustomize) {
    cookieCustomize.addEventListener("click", () => {
      const existing =
        loadCookiePreferences() ||
        window.pnpCookieConsent ||
        { analytics: false, social: false };

      if (analyticsConsent) {
        analyticsConsent.checked = existing.analytics;
      }

      if (socialConsent) {
        socialConsent.checked = existing.social;
      }

      openModal(cookieModal);
    });
  }

  if (cookiePreferencesForm) {
    cookiePreferencesForm.addEventListener(
      "submit",
      (event) => {
        event.preventDefault();

        saveCookiePreferences({
          analytics: analyticsConsent?.checked ?? false,
          social: socialConsent?.checked ?? false
        });
      }
    );
  }

  if (cookiePreferencesClose) {
    cookiePreferencesClose.addEventListener("click", () => {
      closeModal(cookieModal);
    });
  }

  // ====================================================
  // 10. CLOSE MODALS WITH ESC OR BACKDROP
  // ====================================================

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (activeModal) {
        closeModal(activeModal);
      } else {
        closeSearch();
        closeMoreDropdown();
        closeMobileMenu();
      }
    }

    // Keep keyboard navigation inside an open modal.
    if (event.key === "Tab" && activeModal) {
      const focusable = Array.from(
        activeModal.querySelectorAll(
          'a[href], button:not([disabled]), ' +
          'input:not([disabled]), select:not([disabled]), ' +
          'textarea:not([disabled])'
        )
      ).filter((element) => {
        return element.getClientRects().length > 0;
      });

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  [loginModal, cookieModal].forEach((modal) => {
    if (!modal) return;

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });
  });

  // ====================================================
  // 11. FUTURE FEATURE PLACEHOLDER BUTTONS
  // ====================================================

  $$("[data-next]").forEach((element) => {
    element.addEventListener("click", (event) => {
      event.preventDefault();

      const feature =
        element.getAttribute("data-next") ||
        "This feature";

      showToast(
        `${feature} will be connected after the required official information or backend service is available.`
      );
    });
  });

  // ====================================================
  // 12. SMOOTH SCROLL FOR SAME-PAGE LINKS
  // ====================================================

  $$('a[href^="#"]').forEach((link) => {
    if (link.hasAttribute("data-next")) return;

    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") return;

      let target;

      try {
        target = document.querySelector(targetId);
      } catch (error) {
        return;
      }

      if (!target) return;

      event.preventDefault();

      const reducedMotion =
        window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

      target.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start"
      });
    });
  });

  // ====================================================
  // 13. BREAKING NEWS
  // ====================================================

  const breakingNews = get("breakingNews");

  // Future CMS integration will determine whether
  // the strip is visible and which approved headline
  // is displayed.
  //
  // Example future data:
  // {
  //   enabled: true,
  //   headline: "Approved announcement",
  //   url: "/pages/news-detail.html"
  // }

  if (breakingNews) {
    breakingNews.setAttribute(
      "data-cms-controlled",
      "pending"
    );
  }

  // ====================================================
  // 14. LIVE STATISTICS
  // ====================================================

  // The specification requires:
  // Members, Volunteers, Grievances Resolved,
  // Donations Received.
  //
  // Never invent these numbers.
  // Future backend integration will provide totals
  // and admin-controlled visibility.

  function updateStatistics(stats) {
    if (!stats || typeof stats !== "object") return;

    const statTypes = [
      "members",
      "volunteers",
      "resolved",
      "donations"
    ];

    statTypes.forEach((type) => {
      const element = document.querySelector(
        `[data-stat="${type}"]`
      );

      if (!element) return;

      const item = stats[type];

      if (!item || item.visible === false) {
        const card = element.closest(".stat-card");

        if (card) card.hidden = true;
        return;
      }

      const card = element.closest(".stat-card");

      if (card) card.hidden = false;

      if (
        typeof item.value !== "number" ||
        !Number.isFinite(item.value)
      ) {
        return;
      }

      if (type === "donations") {
        element.textContent = new Intl.NumberFormat(
          "en-IN",
          {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
          }
        ).format(item.value);
      } else {
        element.textContent = new Intl.NumberFormat(
          "en-IN"
        ).format(item.value);
      }
    });
  }

  // Sample counts stay visible until real data is supplied.
  updateStatistics({
    members: { value: 24850, visible: true },
    volunteers: { value: 3240, visible: true },
    resolved: { value: 1875, visible: true },
    donations: { value: 1860000, visible: true }
  });

  // Available for future backend integration.
  window.PNPHomepage = {
    updateStatistics,
    showToast
  };

  // ====================================================
  // 15. PAGE INITIALIZATION
  // ====================================================

  console.info(
    "PNP Homepage UI initialized. " +
    "Official content and backend services are pending."
  );

});

/* ======================================================
   END OF PNP HOMEPAGE SCRIPT
====================================================== */

// Seamless right-to-left newsroom ticker. Add real items to the first group in HTML.
document.addEventListener("DOMContentLoaded", () => {
  const ticker = document.querySelector(".news-ticker");
  const track = ticker?.querySelector(".news-ticker-track");
  const group = track?.querySelector(".news-ticker-group");
  if (!ticker || !track || !group) return;

  const originalItems = Array.from(group.children).map(item => item.cloneNode(true));
  const copy = group.cloneNode(true);
  copy.setAttribute("aria-hidden", "true");
  copy.setAttribute("inert", "");
  track.append(copy);

  function sizeTicker() {
    group.replaceChildren(...originalItems.map(item => item.cloneNode(true)));
    if (group.scrollWidth > 0) {
      while (group.scrollWidth < ticker.clientWidth) {
        originalItems.forEach(item => {
          const repeatedItem = item.cloneNode(true);
          repeatedItem.setAttribute("aria-hidden", "true");
          repeatedItem.setAttribute("inert", "");
          group.append(repeatedItem);
        });
      }
    }
    copy.replaceChildren(...Array.from(group.children).map(item => item.cloneNode(true)));
    ticker.style.setProperty("--ticker-duration", `${Math.max(18, group.scrollWidth / 42)}s`);
  }
  sizeTicker();
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(sizeTicker).observe(ticker);
  } else {
    window.addEventListener("resize", sizeTicker);
  }
  document.fonts?.ready.then(sizeTicker);
});

// Reveal the photo diamonds when scrolling into the participation section.
document.addEventListener("DOMContentLoaded", () => {
  const collage = document.querySelector(".collage-motion");
  if (!collage || !window.IntersectionObserver ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  collage.classList.add("collage-ready");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        collage.classList.add("collage-visible");
      } else {
        collage.classList.remove("collage-visible");
      }
    });
  }, { threshold: 0.25 });
  observer.observe(collage);
});

// Continuous left-to-right event carousel.
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector("#upcomingEvents .events-grid");
  if (!grid) return;
  const cards = Array.from(grid.children);
  if (!cards.length) return;
  const track = document.createElement("div");
  track.className = "events-scroll-track";
  const group = document.createElement("div");
  group.className = "events-scroll-group";
  cards.forEach(card => group.append(card));
  const copy = group.cloneNode(true);
  copy.setAttribute("aria-hidden", "true");
  copy.setAttribute("inert", "");
  track.append(group, copy);
  grid.append(track);
  grid.classList.add("events-scrolling");
  function resizeEvents() {
    const count = window.innerWidth <= 550 ? 1 : window.innerWidth <= 1050 ? 2 : 4;
    grid.style.setProperty("--event-card-width", ((grid.clientWidth - (count - 1) * 18) / count) + "px");
  }
  resizeEvents();
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(resizeEvents).observe(grid);
  else window.addEventListener("resize", resizeEvents);
});

// Spread the Latest News cards from the centre on scroll, then leave them still.
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector("#latestNews .news-grid");
  if (!grid || !window.IntersectionObserver ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cards = Array.from(grid.querySelectorAll(".news-card"));
  if (!cards.length) return;
  grid.classList.add("news-centre-reveal");

  function positionNewsCards() {
    cards.forEach(card => {
      card.style.setProperty("--news-centre-x", `${grid.clientWidth / 2 - card.offsetLeft - card.offsetWidth / 2}px`);
      card.style.setProperty("--news-centre-y", `${grid.clientHeight / 2 - card.offsetTop - card.offsetHeight / 2}px`);
    });
  }
  positionNewsCards();
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(positionNewsCards).observe(grid);
  else window.addEventListener("resize", positionNewsCards);
  document.fonts?.ready.then(positionNewsCards);

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.12) {
        grid.classList.add("news-centre-visible");
      } else if (!entry.isIntersecting) {
        grid.classList.remove("news-centre-visible");
      }
    });
  }, { threshold: [0, 0.12] });
  observer.observe(grid);
  grid.addEventListener("focusin", () => grid.classList.add("news-centre-visible"));
});

// Animate district connections only while the finder is visible.
document.addEventListener("DOMContentLoaded", () => {
  const network = document.querySelector(".district-network");
  if (!network || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const svg = network.querySelector(".district-connectors");
  const original = svg?.querySelector("path");
  if (svg && original) {
    const ns = "http://www.w3.org/2000/svg";
    const signals = document.createElementNS(ns, "g");
    signals.setAttribute("class", "district-signals");
    const paths = original.getAttribute("d").match(/M[^M]+/g) || [];
    paths.forEach((d, index) => {
      const pulse = document.createElementNS(ns, "path");
      pulse.setAttribute("d", d);
      pulse.setAttribute("pathLength", "100");
      pulse.style.setProperty("--signal-delay", `${index * .65}s`);
      signals.append(pulse);
    });
    svg.append(signals);
    const ripples = document.createElementNS(ns, "g");
    ripples.setAttribute("class", "district-connection-ripples");
    const origin = original.getAttribute("d").match(/^M\s*([\d.]+)[ ,]+([\d.]+)/);
    if (origin) {
      [0, 1.6].forEach(delay => {
        const ring = document.createElementNS(ns, "circle");
        ring.setAttribute("cx", origin[1]);
        ring.setAttribute("cy", origin[2]);
        ring.setAttribute("r", "5");
        ring.style.setProperty("--ripple-delay", delay + "s");
        ripples.append(ring);
      });
      svg.append(ripples);
    }
  }
  network.querySelectorAll(".district-feature").forEach((label, index) => label.style.setProperty("--label-order", index));
  function positionDistrictCards() {
    const hubX = network.clientWidth * .2;
    const hubY = network.clientHeight * (115 / 220);
    network.querySelectorAll(".district-feature").forEach(label => {
      let x = 0, y = 0, element = label;
      while (element && element !== network) {
        x += element.offsetLeft;
        y += element.offsetTop;
        element = element.offsetParent;
      }
      label.style.setProperty("--district-enter-x", (hubX - x - label.offsetWidth / 2) + "px");
      label.style.setProperty("--district-enter-y", (hubY - y - label.offsetHeight / 2) + "px");
    });
  }
  positionDistrictCards();
  if (window.ResizeObserver) new ResizeObserver(positionDistrictCards).observe(network);
  else window.addEventListener("resize", positionDistrictCards);
  document.fonts?.ready.then(positionDistrictCards);
  network.classList.add("district-animated");
  if (window.IntersectionObserver) {
    new IntersectionObserver(entries => {
      entries.forEach(entry => network.classList.toggle("district-in-view", entry.isIntersecting));
    }, { threshold: .2 }).observe(network);
  } else network.classList.add("district-in-view");
});



// Keep updates fixed until their reserved space above the footer enters view.
document.addEventListener("DOMContentLoaded", () => {
  const strip = document.getElementById("breakingNews");
  const space = document.querySelector(".newsroom-dock-space");
  if (!strip || !space) return;
  const mobileBar = document.querySelector(".mobile-sticky-bar");
  let queued = false;
  function updateNewsroomDock() {
    queued = false;
    const mobileOffset = mobileBar && getComputedStyle(mobileBar).display !== "none" ? mobileBar.getBoundingClientRect().height : 0;
    space.style.height = strip.getBoundingClientRect().height + "px";
    const reachedFooter = space.getBoundingClientRect().bottom <= window.innerHeight - mobileOffset;
    strip.classList.toggle("newsroom-at-footer", reachedFooter);
    strip.style.setProperty("--newsroom-bottom", mobileOffset + "px");
  }
  function scheduleDock() {
    if (!queued) { queued = true; requestAnimationFrame(updateNewsroomDock); }
  }
  window.addEventListener("scroll", scheduleDock, { passive: true });
  window.addEventListener("resize", scheduleDock);
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(scheduleDock).observe(strip);
  document.fonts?.ready.then(scheduleDock);
  updateNewsroomDock();
});

// Reveal the five Official Channels cards in sequence on scroll.
document.addEventListener("DOMContentLoaded", () => {
  const section = document.getElementById("officialSocial");
  if (!section || !window.IntersectionObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  section.querySelectorAll(".social-card").forEach((card, index) => {
    card.style.setProperty("--channel-order", index);

  });
  section.classList.add("channels-reveal-ready");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio >= .15) section.classList.add("channels-reveal-visible");
      else if (!entry.isIntersecting) section.classList.remove("channels-reveal-visible");
    });
  }, { threshold: [0, .15] });
  observer.observe(section);
});
