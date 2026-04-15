// ── DOC SWITCH ──
function switchDoc(doc) {
  ["tos", "pp"].forEach((d) => {
    document.getElementById("panel-" + d).classList.toggle("active", d === doc);
    document.getElementById(
      "sideNav" + d.charAt(0).toUpperCase() + d.slice(1),
    ).style.display = d === doc ? "block" : "none";
    document
      .getElementById("sideTab" + d.charAt(0).toUpperCase() + d.slice(1))
      .classList.toggle("active", d === doc);
  });
  // Reset active sidebar link
  document
    .querySelectorAll(".sidebar-link")
    .forEach((l) => l.classList.remove("active"));
  const firstLink = document.querySelector(
    "#sideNav" + doc.charAt(0).toUpperCase() + doc.slice(1) + " .sidebar-link",
  );
  if (firstLink) firstLink.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ── SCROLL TO SECTION ──
function scrollTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  // Update active sidebar link
  document
    .querySelectorAll(".sidebar-link")
    .forEach((l) => l.classList.remove("active"));
  event.currentTarget.classList.add("active");
}

// ── READING PROGRESS BAR ──
window.addEventListener("scroll", () => {
  const doc = document.documentElement;
  const scrolled = doc.scrollTop || document.body.scrollTop;
  const total =
    (doc.scrollHeight || document.body.scrollHeight) - doc.clientHeight;
  const pct = total > 0 ? (scrolled / total) * 100 : 0;
  document.getElementById("readingBar").style.width = pct + "%";
});

// ── ACTIVE SECTION TRACKING ──
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        document
          .querySelectorAll(".sidebar-link")
          .forEach((l) => l.classList.remove("active"));
        const link = document.querySelector(
          `.sidebar-link[onclick="scrollTo('${id}')"]`,
        );
        if (link) link.classList.add("active");
      }
    });
  },
  { rootMargin: "-20% 0px -70% 0px" },
);

document.querySelectorAll(".section[id]").forEach((s) => observer.observe(s));

// ── THEME ──
document.getElementById("themeBtn").addEventListener("click", function () {
  const html = document.documentElement;
  const dark = html.getAttribute("data-theme") === "dark";
  html.setAttribute("data-theme", dark ? "light" : "dark");
  this.innerHTML = dark
    ? '<i class="fa fa-moon"></i>'
    : '<i class="fa fa-sun"></i>';
});

// ── URL HASH NAVIGATION ──
window.addEventListener("DOMContentLoaded", () => {
  const hash = window.location.hash.replace("#", "");
  if (hash.startsWith("pp-")) {
    switchDoc("pp");
    setTimeout(() => {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  } else if (hash.startsWith("tos-")) {
    setTimeout(() => {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }
});

//footer current year
const year = new Date().getFullYear();
const elements = document.querySelectorAll(".ft-cyr");

elements.forEach(el => {
  el.innerHTML = year;
});