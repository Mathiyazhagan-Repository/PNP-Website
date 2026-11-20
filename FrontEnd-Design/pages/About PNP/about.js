"use strict";

// Five upright goals follow the upper dashed arc, wrapping right-to-left at its ends.
document.addEventListener("DOMContentLoaded", () => {
  const journey = document.querySelector(".vision-journey");
  const image = journey?.querySelector(".vision-main-image");
  const svg = journey?.querySelector(".vision-journey-arc");
  if (!journey || !image || !svg) return;
  const order = ["inclusive", "education", "sustainable", "health", "economy"];
  const goals = order.map(key => journey.querySelector(`.vision-goal-${key}`)).filter(Boolean);
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const ns = "http://www.w3.org/2000/svg";
  let geometry, links = [], progress = 0, lastTime = null, frame = null, inView = true, hovered = false;
  journey.classList.add("vision-arc-moving");

  function layoutArc() {
    const box = journey.getBoundingClientRect(), photo = image.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const cx = photo.left - box.left + photo.width / 2, cy = photo.bottom - box.top;
    const innerRx = photo.width / 2, innerRy = photo.height;
    geometry = { cx, cy, rx: innerRx + 24, ry: innerRy + 26 };
    const samples = [{ angle: Math.PI + .18, distance: 0 }];
    let total = 0, previous = null;
    for (let i = 0; i <= 240; i++) {
      const angle = Math.PI + .18 + i / 240 * (Math.PI - .36);
      const point = { x: geometry.rx * Math.cos(angle), y: geometry.ry * Math.sin(angle) };
      if (previous) total += Math.hypot(point.x - previous.x, point.y - previous.y);
      samples.push({ angle, distance: total }); previous = point;
    }
    geometry.samples = samples; geometry.arcLength = total;
    svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
    svg.innerHTML = `<path d="M${cx-innerRx} ${cy}A${innerRx} ${innerRy} 0 0 1 ${cx+innerRx} ${cy}" fill="none" stroke="#ffcf00" stroke-width="9"/><path d="M${cx-geometry.rx} ${cy}A${geometry.rx} ${geometry.ry} 0 0 1 ${cx+geometry.rx} ${cy}" fill="none" stroke="#16418a" stroke-width="1.1" stroke-dasharray="3 3"/>`;
    links = goals.map(() => {
      const line = document.createElementNS(ns, "path"), dot = document.createElementNS(ns, "circle");
      line.setAttribute("fill", "none"); line.setAttribute("stroke", "#4088c5");
      line.setAttribute("stroke-width", "1.3"); line.setAttribute("stroke-dasharray", "1.5 3");
      line.setAttribute("stroke-linecap", "round");
      dot.setAttribute("r", "3.5"); dot.setAttribute("fill", "#159fe1");
      dot.setAttribute("stroke", "#073b83"); dot.setAttribute("stroke-width", "1.5");
      svg.append(line, dot); return { line, dot };
    });
    renderGoals();
  }
  function renderGoals() {
    if (!geometry) return;
    const { cx, cy, rx, ry } = geometry;
    goals.forEach((goal, i) => {
      const phase = motionPreference.matches ? .04 + i * .23 : (progress + i / goals.length) % 1;
      const target = phase * geometry.arcLength;
      const sample = geometry.samples.findIndex(item => item.distance >= target);
      const next = geometry.samples[Math.max(1, sample)];
      const previous = geometry.samples[Math.max(0, sample - 1)];
      const fraction = (target - previous.distance) / Math.max(.001, next.distance - previous.distance);
      const angle = previous.angle + (next.angle - previous.angle) * fraction;
      const px = cx + rx * Math.cos(angle), py = cy + ry * Math.sin(angle);
      const nx = Math.cos(angle) / rx, ny = Math.sin(angle) / ry, length = Math.hypot(nx, ny);
      const ux = nx / length, uy = ny / length;
      const radius = goal.querySelector(".vision-goal-icon").offsetWidth / 2;
      // Leave enough space for several visible dots between the badge and the arc.
      const connectorGap = Math.max(16, Math.min(21, radius * .6));
      const bx = px + ux * (radius + connectorGap), by = py + uy * (radius + connectorGap);
      goal.style.left = `${bx-radius}px`; goal.style.top = `${by-radius}px`;
      goal.style.opacity = motionPreference.matches ? "1" : String(Math.min(1, phase / .035, (1-phase) / .035));
      goal.classList.toggle("vision-label-left", px > cx + rx * .4);
      const edgeX = bx - ux * (radius - 1), edgeY = by - uy * (radius - 1);
      links[i].line.setAttribute("d", `M${px} ${py}L${edgeX} ${edgeY}`);
      links[i].line.setAttribute("opacity", goal.style.opacity);
      links[i].dot.setAttribute("opacity", goal.style.opacity);
      links[i].dot.setAttribute("cx", px); links[i].dot.setAttribute("cy", py);
    });
    // Keep each label clear of other labels and all neighbouring badges.
    const badges = goals.map(goal => goal.querySelector(".vision-goal-icon").getBoundingClientRect());
    const occupied = [];
    const overlaps = (a, b) => a.left < b.right + 4 && a.right > b.left - 4 && a.top < b.bottom + 4 && a.bottom > b.top - 4;
    goals.forEach((goal, index) => {
      const label = goal.querySelector(".vision-goal-label");
      const icon = goal.querySelector(".vision-goal-icon");
      const candidates = [icon.offsetHeight + 4, -label.offsetHeight - 4, icon.offsetHeight + label.offsetHeight + 9, -2 * label.offsetHeight - 9];
      for (const top of candidates) {
        label.style.top = top + "px";
        const rect = label.getBoundingClientRect();
        if (!occupied.some(other => overlaps(rect, other)) && !badges.some((other, i) => i !== index && overlaps(rect, other))) break;
      }
      if (Number(goal.style.opacity) > .15) occupied.push(label.getBoundingClientRect());
    });
  }
  function animate(time) {
    frame = null;
    if (lastTime !== null && !hovered && !document.hidden) progress = (progress + Math.min(time-lastTime, 64) / 42000) % 1;
    lastTime = time; renderGoals();
    if (inView && !motionPreference.matches) frame = requestAnimationFrame(animate);
  }
  function start() { if (frame === null && inView && !motionPreference.matches) { lastTime = null; frame = requestAnimationFrame(animate); } }
  journey.addEventListener("mouseenter", () => hovered = true);
  journey.addEventListener("mouseleave", () => hovered = false);
  if (window.IntersectionObserver) new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    if (!inView && frame !== null) { cancelAnimationFrame(frame); frame = null; }
    start();
  }).observe(journey);
  if (window.ResizeObserver) new ResizeObserver(layoutArc).observe(journey);
  window.addEventListener("resize", layoutArc);
  document.fonts?.ready.then(layoutArc);
  motionPreference.addEventListener("change", () => { if (frame !== null) cancelAnimationFrame(frame); frame = null; renderGoals(); start(); });
  layoutArc(); start();
});

// Spin the three triangular pillars outward from the PNP circle on scroll.
document.addEventListener("DOMContentLoaded", () => {
  const triad = document.querySelector(".ideology-triad");
  if (!triad || !window.IntersectionObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  triad.classList.add("triad-ready");
  new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio >= .2) triad.classList.add("triad-visible");
      else if (!entry.isIntersecting) triad.classList.remove("triad-visible");
    });
  }, { threshold: [0, .2] }).observe(triad);
});

// Reveal the history route and milestones as the section enters view.
document.addEventListener("DOMContentLoaded", () => {
  const history = document.querySelector("#partyHistory");
  if (!history || !window.IntersectionObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  history.querySelectorAll(".history-milestone").forEach((card, index) => card.style.setProperty("--history-step", index));
  history.classList.add("history-motion-ready");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        history.classList.add("history-motion-visible");
        observer.disconnect();
      }
    });
  }, { threshold: .08 });
  observer.observe(history);
  history.addEventListener("focusin", () => history.classList.add("history-motion-visible"));
});

// Reveal the organisation hierarchy from state leadership down to local units.
document.addEventListener("DOMContentLoaded", () => {
  const section = document.getElementById("partyStructure");
  const chart = section?.querySelector(".structure-chart");
  if (!section || !chart || !window.IntersectionObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  section.querySelectorAll(".structure-branch").forEach((branch, index) => branch.style.setProperty("--branch-order", index));
  section.querySelectorAll(".structure-leadership-links > a").forEach((link, index) => link.style.setProperty("--leadership-order", index));
  section.classList.add("structure-motion-ready");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio >= .15) section.classList.add("structure-motion-visible");
      else if (!entry.isIntersecting) section.classList.remove("structure-motion-visible");
    });
  }, { threshold: [0, .15] });
  observer.observe(chart);
  section.addEventListener("focusin", () => section.classList.add("structure-motion-visible"));
});

