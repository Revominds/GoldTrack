// ============================================================
// DATA GENERATION
// ============================================================
const ghNames = [
  "Kofi Asante",
  "Ama Osei",
  "Kwame Boateng",
  "Abena Mensah",
  "Yaw Darko",
  "Akosua Amoah",
  "Kojo Acheampong",
  "Efua Tetteh",
  "Nana Owusu",
  "Fiifi Quaye",
  "Adwoa Ankrah",
  "Kwabena Sarpong",
  "Esi Nyarko",
  "Kweku Frimpong",
  "Akua Bonsu",
  "Yaa Adjei",
  "Kofi Afriyie",
  "Afia Adomako",
  "Nii Lante",
  "Mawuli Atsutse",
  "Dzifa Agbesi",
  "Kwame Oduro",
  "Ama Yeboah",
  "Adjoa Asante",
  "Kofi Obeng",
  "Abena Ababio",
  "Kojo Takyi",
  "Efua Mensah",
  "Yaw Asiedu",
  "Akosua Quansah",
  "Nana Amponsah",
  "Fiifi Aryee",
  "Adwoa Ofori",
  "Kwabena Kusi",
  "Esi Boamah",
  "Kofi Poku",
  "Ama Twum",
  "Abena Sarfo",
  "Kwame Nkrumah Jr",
  "Akua Asante",
  "Yaa Owusu",
  "Nii Odartey",
  "Dzifa Kofie",
  "Kojo Mensah",
  "Efua Darko",
  "Afia Tetteh",
  "Kweku Asante",
  "Esi Amoah",
  "Nana Quaye",
  "Mawuli Deku",
];
const locations = [
  "Accra",
  "Kumasi",
  "Takoradi",
  "Tamale",
  "Sunyani",
  "Ho",
  "Koforidua",
  "Cape Coast",
  "Techiman",
  "Obuasi",
  "Tema",
  "Madina",
  "Kasoa",
  "Ashaiman",
  "Prestea",
];
const statuses = [
  "Complete",
  "Complete",
  "Complete",
  "Complete",
  "Pending",
  "Complete",
  "Complete",
];
const karats = [24, 22, 22, 22, 21, 18, 18, 14];
const SPOT_USD = 3342.8;
const RATE = 15.32;

function randEl(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}
function fmtDate(d) {
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function fmtMoney(n) {
  return n.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
function goldPricePerGram(karat, currency = "GHS") {
  const purity = karat / 24;
  const usdPerGram = (SPOT_USD / 31.1035) * purity;
  return currency === "GHS" ? usdPerGram * RATE : usdPerGram;
}

const TX_DATA = [];
for (let i = 1; i <= 120; i++) {
  const type = Math.random() > 0.4 ? "Sell" : "Buy";
  const karat = randEl(karats);
  const weight = +(randInt(2, 200) / 10).toFixed(1);
  const price = +(
    goldPricePerGram(karat) *
    weight *
    (1 + randInt(-5, 8) / 100)
  ).toFixed(2);
  const d = new Date(2024, randInt(0, 11), randInt(1, 28));
  TX_DATA.push({
    id: `TXN-${String(i).padStart(4, "0")}`,
    date: d,
    customer: randEl(ghNames),
    type,
    karat: `${karat}K`,
    weight,
    unitPrice: +goldPricePerGram(karat).toFixed(2),
    total: +price.toFixed(2),
    status: randEl(statuses),
  });
}
TX_DATA.sort((a, b) => b.date - a.date);

const CUST_DATA = [];
for (let i = 1; i <= 80; i++) {
  const spent = randInt(5000, 500000);
  const purchases = randInt(1, 40);
  const tier =
    spent > 200000
      ? "VIP"
      : spent > 50000
        ? "Gold"
        : spent > 15000
          ? "Silver"
          : "Bronze";
  CUST_DATA.push({
    id: `CUST-${String(i).padStart(3, "0")}`,
    name: ghNames[(i - 1) % ghNames.length],
    phone: `+233 ${randInt(20, 59)} ${randInt(100, 999)} ${randInt(1000, 9999)}`,
    location: randEl(locations),
    purchases,
    spent,
    tier,
    status: Math.random() > 0.1 ? "Active" : "Inactive",
    initials: ghNames[(i - 1) % ghNames.length]
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  });
}

// Receipts
const RECEIPT_DATA = TX_DATA.slice(0, 20).map((t, i) => ({
  ...t,
  receiptNo: `RCP-${String(i + 1).padStart(4, "0")}`,
}));

// ============================================================
// PAGINATION STATE
// ============================================================
let txVisible = 20,
  txSearch = "";
let custVisible = 20,
  custSearch = "";
let receiptSearch = "";

function filteredTx() {
  const q = txSearch.toLowerCase();
  if (!q) return TX_DATA;
  return TX_DATA.filter(
    (t) =>
      t.customer.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      t.type.toLowerCase().includes(q) ||
      t.status.toLowerCase().includes(q) ||
      t.karat.toLowerCase().includes(q),
  );
}
function filteredCust() {
  const q = custSearch.toLowerCase();
  if (!q) return CUST_DATA;
  return CUST_DATA.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.tier.toLowerCase().includes(q) ||
      c.phone.includes(q),
  );
}

function renderTx() {
  const data = filteredTx();
  const show = data.slice(0, txVisible);
  const body = document.getElementById("txBody");
  if (!show.length) {
    body.innerHTML =
      '<tr><td colspan="9"><div class="empty-state"><i class="fa fa-search"></i>No transactions found</div></td></tr>';
    return;
  }
  body.innerHTML = show
    .map(
      (t) => `<tr>
    <td style="font-weight:500;color:var(--gold)">${t.id}</td>
    <td>${fmtDate(t.date)}</td>
    <td>${t.customer}</td>
    <td><span class="badge ${t.type === "Buy" ? "badge-buy" : "badge-sell"}">${t.type}</span></td>
    <td>${t.karat}</td>
    <td>${t.weight}g</td>
    <td>GHS ${fmtMoney(t.unitPrice)}</td>
    <td style="font-weight:500">GHS ${fmtMoney(t.total)}</td>
    <td><span class="badge ${t.status === "Complete" ? "badge-complete" : "badge-pending"}">${t.status}</span></td>
  </tr>`,
    )
    .join("");
  document.getElementById("txInfo").textContent =
    `Showing ${show.length} of ${data.length} transactions`;
  document.getElementById("txVisibleCount").textContent = show.length;
  const btn = document.getElementById("txLoadMore");
  if (txVisible >= data.length) {
    btn.disabled = true;
    btn.textContent = "All loaded";
  } else {
    btn.disabled = false;
    btn.textContent = `Load More (${Math.min(20, data.length - txVisible)} more)`;
  }
}
function loadMoreTx() {
  txVisible += 20;
  renderTx();
}

function renderCust() {
  const data = filteredCust();
  const show = data.slice(0, custVisible);
  const body = document.getElementById("custBody");
  if (!show.length) {
    body.innerHTML =
      '<tr><td colspan="8"><div class="empty-state"><i class="fa fa-search"></i>No customers found</div></td></tr>';
    return;
  }
  const tierColors = {
    VIP: "badge-sell",
    Gold: "badge-pending",
    Silver: "badge-active",
    Bronze: "badge-inactive",
  };
  body.innerHTML = show
    .map(
      (c) => `<tr>
    <td style="color:var(--text3);font-size:11px">${c.id}</td>
    <td><div style="display:flex;align-items:center;gap:10px"><div class="cust-av">${c.initials}</div><div><div style="font-weight:500">${c.name}</div></div></div></td>
    <td style="color:var(--text2)">${c.phone}</td>
    <td>${c.location}</td>
    <td style="text-align:center">${c.purchases}</td>
    <td style="font-weight:500">GHS ${fmtMoney(c.spent)}</td>
    <td><span class="badge ${tierColors[c.tier]}">${c.tier}</span></td>
    <td><span class="badge ${c.status === "Active" ? "badge-active" : "badge-inactive"}">${c.status}</span></td>
  </tr>`,
    )
    .join("");
  document.getElementById("custInfo").textContent =
    `Showing ${show.length} of ${data.length} customers`;
  document.getElementById("custVisibleCount").textContent = show.length;
  const btn = document.getElementById("custLoadMore");
  if (custVisible >= data.length) {
    btn.disabled = true;
    btn.textContent = "All loaded";
  } else {
    btn.disabled = false;
    btn.textContent = `Load More (${Math.min(20, data.length - custVisible)} more)`;
  }
}
function loadMoreCust() {
  custVisible += 20;
  renderCust();
}

document.getElementById("txSearch").addEventListener("input", function () {
  txSearch = this.value;
  txVisible = 20;
  renderTx();
});
document.getElementById("custSearch").addEventListener("input", function () {
  custSearch = this.value;
  custVisible = 20;
  renderCust();
});

// Dashboard recent transactions (top 5)
function renderDashTx() {
  const show = TX_DATA.slice(0, 5);
  document.getElementById("dashTxBody").innerHTML = show
    .map(
      (t) => `<tr>
    <td>${t.customer}</td>
    <td><span class="badge ${t.type === "Buy" ? "badge-buy" : "badge-sell"}">${t.type}</span></td>
    <td>${t.weight}g</td>
    <td style="font-weight:500">GHS ${fmtMoney(t.total)}</td>
    <td><span class="badge ${t.status === "Complete" ? "badge-complete" : "badge-pending"}">${t.status}</span></td>
  </tr>`,
    )
    .join("");
}

// Receipts
function filteredReceipts() {
  const q = receiptSearch.toLowerCase();
  if (!q) return RECEIPT_DATA;
  return RECEIPT_DATA.filter(
    (t) =>
      t.receiptNo.toLowerCase().includes(q) ||
      t.customer.toLowerCase().includes(q) ||
      t.type.toLowerCase().includes(q) ||
      t.karat.toLowerCase().includes(q) ||
      t.status.toLowerCase().includes(q),
  );
}

function renderReceipts() {
  const data = filteredReceipts();
  const body = document.getElementById("receiptBody");
  if (!data.length) {
    body.innerHTML =
      '<tr><td colspan="6"><div class="empty-state"><i class="fa fa-search"></i>No receipts found</div></td></tr>';
    return;
  }
  body.innerHTML = data
    .map(
      (t) => `<tr>
    <td style="font-weight:500;color:var(--gold)">${t.receiptNo}</td>
    <td>${fmtDate(t.date)}</td>
    <td>${t.customer}</td>
    <td><span class="badge ${t.type === "Buy" ? "badge-buy" : "badge-sell"}">${t.type}</span></td>
    <td style="font-weight:500">GHS ${fmtMoney(t.total)}</td>
    <td><button class="btn btn-outline" style="height:28px;padding:0 10px;font-size:11px" onclick="printReceipt('${t.receiptNo}')"><i class="fa fa-print"></i> Print</button></td>
  </tr>`,
    )
    .join("");
}

// ============================================================
// CHARTS
// ============================================================
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const revenueData = [
  185000, 210000, 195000, 240000, 278000, 302000, 265000, 310000, 288000,
  334000, 318000, 356000,
];
const volumeData = [180, 210, 190, 230, 268, 295, 258, 304, 280, 322, 308, 342];

function getChartTheme() {
  const dark = document.documentElement.getAttribute("data-theme") === "dark";
  return {
    grid: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    text: dark ? "#9A9080" : "#7A7060",
    tick: dark ? "#5A5448" : "#B0A590",
  };
}

let revenueChart, donutChart, annualChart;
function initCharts() {
  const t = getChartTheme();
  const ctx1 = document.getElementById("revenueChart");
  const ctx2 = document.getElementById("donutChart");
  const ctx3 = document.getElementById("annualChart");
  if (!ctx1 || !ctx2 || !ctx3) return;

  Chart.defaults.font.family = "'DM Sans',sans-serif";
  Chart.defaults.font.size = 11;

  if (revenueChart) revenueChart.destroy();
  revenueChart = new Chart(ctx1, {
    type: "bar",
    data: {
      labels: months,
      datasets: [
        {
          label: "Revenue (GHS)",
          data: revenueData,
          backgroundColor: "rgba(201,168,76,0.7)",
          borderRadius: 5,
          yAxisID: "y",
        },
        {
          label: "Volume (g)",
          data: volumeData,
          type: "line",
          borderColor: "#5DBD7A",
          backgroundColor: "rgba(93,189,122,0.12)",
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          borderWidth: 2,
          yAxisID: "y1",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index" },
      plugins: {
        legend: { labels: { color: t.text, boxWidth: 10 } },
        tooltip: {
          backgroundColor: "rgba(26,21,16,.95)",
          titleColor: "#C9A84C",
          bodyColor: "#C8BFA8",
        },
      },
      scales: {
        x: { grid: { color: t.grid }, ticks: { color: t.text } },
        y: {
          grid: { color: t.grid },
          ticks: {
            color: t.text,
            callback: (v) => "GHS " + v.toLocaleString(),
          },
        },
        y1: {
          position: "right",
          grid: { display: false },
          ticks: { color: t.text, callback: (v) => v + "g" },
        },
      },
    },
  });

  if (donutChart) donutChart.destroy();
  donutChart = new Chart(ctx2, {
    type: "doughnut",
    data: {
      labels: ["Sell", "Buy", "Pending"],
      datasets: [
        {
          data: [65, 28, 7],
          backgroundColor: [
            "rgba(201,168,76,0.85)",
            "rgba(93,189,122,0.85)",
            "rgba(186,165,0,0.55)",
          ],
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "72%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: t.text, boxWidth: 10, padding: 14 },
        },
        tooltip: {
          backgroundColor: "rgba(26,21,16,.95)",
          titleColor: "#C9A84C",
          bodyColor: "#C8BFA8",
        },
      },
    },
  });

  if (annualChart) annualChart.destroy();
  annualChart = new Chart(ctx3, {
    type: "line",
    data: {
      labels: months,
      datasets: [
        {
          label: "Revenue (GHS)",
          data: revenueData,
          borderColor: "#C9A84C",
          backgroundColor: "rgba(201,168,76,0.1)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
        },
        {
          label: "Volume (g)",
          data: volumeData.map((v) => v * 500),
          borderColor: "#5DBD7A",
          backgroundColor: "rgba(93,189,122,0.07)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: t.text, boxWidth: 10 } },
        tooltip: {
          backgroundColor: "rgba(26,21,16,.95)",
          titleColor: "#C9A84C",
          bodyColor: "#C8BFA8",
        },
      },
      scales: {
        x: { grid: { color: t.grid }, ticks: { color: t.text } },
        y: {
          grid: { color: t.grid },
          ticks: {
            color: t.text,
            callback: (v) => "GHS " + v.toLocaleString(),
          },
        },
      },
    },
  });
}

// ============================================================
// CALCULATOR
// ============================================================
const KARAT_PURITY = {
  24: 1,
  22: 0.9167,
  21: 0.875,
  18: 0.75,
  14: 0.583,
  10: 0.417,
  9: 0.375,
};
const CURRENCY_RATES = { USD: 1, GHS: RATE, EUR: 0.92, GBP: 0.79 };
const CURRENCY_SYM = { USD: "$", GHS: "₵", EUR: "€", GBP: "£" };

function calcGold() {
  const weight = parseFloat(document.getElementById("calcWeight").value) || 0;
  const karat = parseInt(document.getElementById("calcKarat").value);
  const currency = document.getElementById("calcCurrency").value;
  const margin = parseFloat(document.getElementById("calcMargin").value) || 0;
  const type = document.getElementById("calcType").value;
  const purity = KARAT_PURITY[karat];
  const usdPerOz = SPOT_USD;
  const usdPerGram = usdPerOz / 31.1035;
  const pureGoldValue = weight * purity * usdPerGram;
  const converted = pureGoldValue * CURRENCY_RATES[currency];
  const marginAmt = converted * (margin / 100);
  const finalVal =
    type === "sell" ? converted + marginAmt : converted - marginAmt;
  const sym = CURRENCY_SYM[currency];
  document.getElementById("calcVal").textContent =
    `${sym}${fmtMoney(finalVal)}`;
  document.getElementById("calcSub").textContent =
    `${weight}g of ${karat}K gold · ${purity * 100}% pure`;
  document.getElementById("calcBreakdown").innerHTML = `
    <div class="calc-row"><span>Gold weight</span><span>${weight}g</span></div>
    <div class="calc-row"><span>Pure gold content</span><span>${(weight * purity).toFixed(3)}g</span></div>
    <div class="calc-row"><span>Spot price (USD/oz)</span><span>$${fmtMoney(usdPerOz)}</span></div>
    <div class="calc-row"><span>Base value (${currency})</span><span>${sym}${fmtMoney(converted)}</span></div>
    <div class="calc-row"><span>${type === "sell" ? "Making charge" : "Discount"} (${margin}%)</span><span>${type === "sell" ? "+" : "-"}${sym}${fmtMoney(marginAmt)}</span></div>
    <div class="calc-row"><span><strong>Final price</strong></span><span><strong>${sym}${fmtMoney(finalVal)}</strong></span></div>
  `;
}

function updateKaratTable() {
  const spot = parseFloat(document.getElementById("simSpot").value) || SPOT_USD;
  const rate = parseFloat(document.getElementById("simRate").value) || RATE;
  const perGram = spot / 31.1035;
  const rows = Object.entries(KARAT_PURITY).map(
    ([k, p]) => `<tr>
    <td style="font-weight:500">${k}K</td>
    <td>${(p * 100).toFixed(1)}%</td>
    <td>$${(perGram * p).toFixed(2)}</td>
    <td>₵${(perGram * p * rate).toFixed(2)}</td>
  </tr>`,
  );
  document.getElementById("karatTableBody").innerHTML = rows.join("");
}

// ============================================================
// NAVIGATION
// ============================================================
function showPage(id) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));
  const page = document.getElementById("page-" + id);
  if (page) {
    page.classList.add("active");
    // Re-init charts if needed
    if (id === "dashboard" || id === "reports") {
      setTimeout(initCharts, 50);
    }
  }
  const navItem = document.querySelector(`.nav-item[data-page="${id}"]`);
  if (navItem) navItem.classList.add("active");
  closeDropdowns();
}

document.querySelectorAll(".nav-item[data-page]").forEach((item) => {
  item.addEventListener("click", function () {
    showPage(this.dataset.page);
  });
});

// ============================================================
// DROPDOWNS
// ============================================================
function closeDropdowns() {
  document
    .querySelectorAll(".dropdown")
    .forEach((d) => d.classList.remove("open"));
}
document.getElementById("notifBtn").addEventListener("click", function (e) {
  e.stopPropagation();
  const d = document.getElementById("notifDropdown");
  const wasOpen = d.classList.contains("open");
  closeDropdowns();
  if (!wasOpen) d.classList.add("open");
});
document
  .getElementById("userAvatarBtn")
  .addEventListener("click", function (e) {
    e.stopPropagation();
    const d = document.getElementById("userDropdown");
    const wasOpen = d.classList.contains("open");
    closeDropdowns();
    if (!wasOpen) d.classList.add("open");
  });
document.addEventListener("click", closeDropdowns);
document
  .querySelectorAll(".dropdown")
  .forEach((d) => d.addEventListener("click", (e) => e.stopPropagation()));

// ============================================================
// THEME
// ============================================================
document.getElementById("themeToggle").addEventListener("click", function () {
  const html = document.documentElement;
  const isDark = html.getAttribute("data-theme") === "dark";
  html.setAttribute("data-theme", isDark ? "light" : "dark");
  this.innerHTML = isDark
    ? '<i class="fa fa-moon"></i>'
    : '<i class="fa fa-sun"></i>';
  setTimeout(initCharts, 50);
});

// ============================================================
// GOLD PRICE SIMULATION (live ticker)
// ============================================================
let currentPrice = 3342.8;
setInterval(() => {
  const delta = (Math.random() - 0.48) * 2;
  currentPrice = +(currentPrice + delta).toFixed(2);
  const change = +(currentPrice - 3342.8).toFixed(2);
  const pct = +((change / 3342.8) * 100).toFixed(2);
  const up = change >= 0;
  document.getElementById("sidebarGoldPrice").textContent =
    `$${currentPrice.toFixed(2)}`;
  document.getElementById("sidebarGoldChange").className =
    `gpw-change ${up ? "gpw-up" : "gpw-down"}`;
  document.getElementById("sidebarGoldChange").innerHTML =
    `<i class="fa fa-arrow-trend-${up ? "up" : "down"}"></i> ${up ? "+" : ""}${change} (${up ? "+" : ""}${pct}%)`;
  document.getElementById("sidebarGoldDate").textContent =
    `XAU/USD · Updated just now`;
}, 4000);

// ============================================================
// GLOBAL NAVBAR SEARCH
// ============================================================
const PAGES_INDEX = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "fa-gauge",
    desc: "Overview, stats & charts",
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: "fa-arrow-right-arrow-left",
    desc: "All buy & sell records",
  },
  {
    id: "customers",
    label: "Customers",
    icon: "fa-users",
    desc: "Manage your client base",
  },
  {
    id: "calculator",
    label: "Calculator",
    icon: "fa-calculator",
    desc: "Gold price & value calculator",
  },
  {
    id: "reports",
    label: "Reports",
    icon: "fa-chart-bar",
    desc: "Generate business reports",
  },
  {
    id: "receipts",
    label: "Receipts",
    icon: "fa-receipt",
    desc: "View & print receipts",
  },
];

function highlight(text, q) {
  if (!q) return text;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp(`(${escaped})`, "gi"), "<mark>$1</mark>");
}

function renderSearchResults(q) {
  const panel = document.getElementById("searchResults");
  if (!q || q.length < 1) {
    panel.classList.remove("open");
    return;
  }

  const ql = q.toLowerCase();
  const txHits = TX_DATA.filter(
    (t) =>
      t.customer.toLowerCase().includes(ql) ||
      t.id.toLowerCase().includes(ql) ||
      t.type.toLowerCase().includes(ql) ||
      t.karat.toLowerCase().includes(ql) ||
      t.status.toLowerCase().includes(ql),
  ).slice(0, 5);

  const custHits = CUST_DATA.filter(
    (c) =>
      c.name.toLowerCase().includes(ql) ||
      c.id.toLowerCase().includes(ql) ||
      c.location.toLowerCase().includes(ql) ||
      c.tier.toLowerCase().includes(ql) ||
      c.phone.includes(ql),
  ).slice(0, 5);

  const pageHits = PAGES_INDEX.filter(
    (p) =>
      p.label.toLowerCase().includes(ql) || p.desc.toLowerCase().includes(ql),
  );

  const total = txHits.length + custHits.length + pageHits.length;
  if (total === 0) {
    panel.innerHTML = `<div class="sr-empty"><i class="fa fa-magnifying-glass"></i>No results for "<strong>${q}</strong>"</div>`;
    panel.classList.add("open");
    return;
  }

  let html = "";

  if (pageHits.length) {
    html += `<div class="sr-section">Pages</div>`;
    html += pageHits
      .map(
        (p) => `
      <div class="sr-item" onclick="showPage('${p.id}');clearSearch()">
        <div class="sr-icon page"><i class="fa ${p.icon}"></i></div>
        <div class="sr-body">
          <div class="sr-title">${highlight(p.label, q)}</div>
          <div class="sr-meta">${highlight(p.desc, q)}</div>
        </div>
        <i class="fa fa-arrow-right sr-arrow"></i>
      </div>`,
      )
      .join("");
  }

  if (txHits.length) {
    html += `<div class="sr-section">Transactions (${txHits.length} of ${TX_DATA.filter((t) => t.customer.toLowerCase().includes(ql) || t.id.toLowerCase().includes(ql) || t.type.toLowerCase().includes(ql) || t.karat.toLowerCase().includes(ql) || t.status.toLowerCase().includes(ql)).length})</div>`;
    html += txHits
      .map(
        (t) => `
      <div class="sr-item" onclick="goToTx('${ql}')">
        <div class="sr-icon tx"><i class="fa fa-arrow-right-arrow-left"></i></div>
        <div class="sr-body">
          <div class="sr-title">${highlight(t.customer, q)} <span style="color:var(--text3);font-size:11px;font-weight:400">· ${t.id}</span></div>
          <div class="sr-meta">${t.type} · ${t.karat} · ${t.weight}g · GHS ${fmtMoney(t.total)} · <span style="color:${t.status === "Complete" ? "var(--success)" : "var(--warn)"}">${t.status}</span></div>
        </div>
        <span class="sr-badge ${t.type === "Buy" ? "badge-buy" : "badge-sell"}">${t.type}</span>
        <i class="fa fa-arrow-right sr-arrow"></i>
      </div>`,
      )
      .join("");
    const allTxCount = TX_DATA.filter(
      (t) =>
        t.customer.toLowerCase().includes(ql) ||
        t.id.toLowerCase().includes(ql) ||
        t.type.toLowerCase().includes(ql) ||
        t.karat.toLowerCase().includes(ql) ||
        t.status.toLowerCase().includes(ql),
    ).length;
    if (allTxCount > 5)
      html += `<div class="sr-footer" onclick="goToTx('${ql}')">View all ${allTxCount} matching transactions →</div>`;
  }

  if (custHits.length) {
    html += `<div class="sr-section">Customers (${custHits.length} of ${CUST_DATA.filter((c) => c.name.toLowerCase().includes(ql) || c.id.toLowerCase().includes(ql) || c.location.toLowerCase().includes(ql) || c.tier.toLowerCase().includes(ql) || c.phone.includes(ql)).length})</div>`;
    html += custHits
      .map(
        (c) => `
      <div class="sr-item" onclick="goToCust('${ql}')">
        <div class="sr-icon cust"><i class="fa fa-user"></i></div>
        <div class="sr-body">
          <div class="sr-title">${highlight(c.name, q)} <span style="color:var(--text3);font-size:11px;font-weight:400">· ${c.id}</span></div>
          <div class="sr-meta">${highlight(c.location, q)} · ${c.purchases} purchases · GHS ${fmtMoney(c.spent)}</div>
        </div>
        <span class="sr-badge ${c.tier === "VIP" ? "badge-sell" : c.tier === "Gold" ? "badge-pending" : c.tier === "Silver" ? "badge-active" : "badge-inactive"}">${c.tier}</span>
        <i class="fa fa-arrow-right sr-arrow"></i>
      </div>`,
      )
      .join("");
    const allCustCount = CUST_DATA.filter(
      (c) =>
        c.name.toLowerCase().includes(ql) ||
        c.id.toLowerCase().includes(ql) ||
        c.location.toLowerCase().includes(ql) ||
        c.tier.toLowerCase().includes(ql) ||
        c.phone.includes(ql),
    ).length;
    if (allCustCount > 5)
      html += `<div class="sr-footer" onclick="goToCust('${ql}')">View all ${allCustCount} matching customers →</div>`;
  }

  panel.innerHTML = html;
  panel.classList.add("open");
}

function goToTx(q) {
  txSearch = q;
  txVisible = 20;
  showPage("transactions");
  document.getElementById("txSearch").value = q;
  renderTx();
  clearSearch();
}
function goToCust(q) {
  custSearch = q;
  custVisible = 20;
  showPage("customers");
  document.getElementById("custSearch").value = q;
  renderCust();
  clearSearch();
}
function clearSearch() {
  const inp = document.getElementById("globalSearch");
  inp.value = "";
  document.getElementById("searchResults").classList.remove("open");
  document.getElementById("navClearBtn").classList.remove("visible");
  document.getElementById("navSearchIcon").style.color = "";
}

const gsInput = document.getElementById("globalSearch");
gsInput.addEventListener("input", function () {
  const q = this.value.trim();
  renderSearchResults(q);
  const clearBtn = document.getElementById("navClearBtn");
  if (q) {
    clearBtn.classList.add("visible");
    document.getElementById("navSearchIcon").style.color = "var(--gold)";
  } else {
    clearBtn.classList.remove("visible");
    document.getElementById("navSearchIcon").style.color = "";
  }
});
gsInput.addEventListener("keydown", function (e) {
  if (e.key === "Escape") clearSearch();
  if (e.key === "Enter") {
    const q = this.value.trim();
    if (q) {
      const txCount = TX_DATA.filter(
        (t) =>
          t.customer.toLowerCase().includes(q.toLowerCase()) ||
          t.id.toLowerCase().includes(q.toLowerCase()),
      ).length;
      const custCount = CUST_DATA.filter(
        (c) =>
          c.name.toLowerCase().includes(q.toLowerCase()) ||
          c.id.toLowerCase().includes(q.toLowerCase()),
      ).length;
      if (custCount >= txCount) goToCust(q);
      else goToTx(q);
    }
  }
});
gsInput.addEventListener("focus", function () {
  if (this.value.trim()) renderSearchResults(this.value.trim());
});
document.getElementById("navClearBtn").addEventListener("click", function (e) {
  e.stopPropagation();
  clearSearch();
});
document
  .getElementById("navSearchWrap")
  .addEventListener("click", (e) => e.stopPropagation());
document.addEventListener("click", function () {
  document.getElementById("searchResults").classList.remove("open");
});

renderDashTx();
renderTx();
renderCust();
renderReceipts();
updateKaratTable();
calcGold();
setTimeout(initCharts, 200);

/// ============================================================
// ADD TRANSACTION MODAL
// ============================================================
(function () {
  const backdrop = document.getElementById("txModalBackdrop");
  const closeBtn = document.getElementById("txModalClose");
  const cancelBtn = document.getElementById("txModalCancel");
  const submitBtn = document.getElementById("txModalSubmit");
  const alert = document.getElementById("txModalAlert");
  const alertMsg = document.getElementById("txModalAlertMsg");

  let selectedType = "Buy";
  document.querySelectorAll(".tx-type-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".tx-type-btn").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      selectedType = btn.dataset.type;
    });
  });

  function openTxModal() {
    resetModal();
    backdrop.classList.add("open");
    document.getElementById("txDate").value = new Date()
      .toISOString()
      .split("T")[0];
    document.body.style.overflow = "hidden";
  }
  function closeTxModal() {
    backdrop.classList.remove("open");
    document.body.style.overflow = "";
  }
  window.openTxModal = openTxModal;

  closeBtn.addEventListener("click", closeTxModal);
  cancelBtn.addEventListener("click", closeTxModal);
  backdrop.addEventListener("click", function (e) {
    if (e.target === backdrop) closeTxModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && backdrop.classList.contains("open"))
      closeTxModal();
  });

  const custInput = document.getElementById("txCustomer");
  const custDropdown = document.getElementById("txCustomerDropdown");

  custInput.addEventListener("input", function () {
    const q = this.value.toLowerCase().trim();
    if (!q) {
      custDropdown.classList.remove("open");
      return;
    }
    const hits = CUST_DATA.filter(function (c) {
      return c.name.toLowerCase().includes(q);
    }).slice(0, 6);
    if (!hits.length) {
      custDropdown.classList.remove("open");
      return;
    }
    custDropdown.innerHTML = hits
      .map(function (c) {
        return (
          '<div class="mcd-item" data-name="' +
          c.name +
          '">' +
          '<div class="mcd-av">' +
          c.initials +
          "</div>" +
          '<div><div style="font-weight:500">' +
          c.name +
          "</div>" +
          '<div style="font-size:11px;color:var(--text3)">' +
          c.location +
          " · " +
          c.tier +
          "</div></div>" +
          "</div>"
        );
      })
      .join("");
    custDropdown.classList.add("open");
  });
  custDropdown.addEventListener("click", function (e) {
    const item = e.target.closest(".mcd-item");
    if (!item) return;
    custInput.value = item.dataset.name;
    custDropdown.classList.remove("open");
    clearFieldError("txCustomer", "txCustomerErr");
  });
  document.addEventListener("click", function (e) {
    if (!custInput.contains(e.target) && !custDropdown.contains(e.target)) {
      custDropdown.classList.remove("open");
    }
  });

  document
    .getElementById("autoFillPrice")
    .addEventListener("click", function () {
      const karat = parseInt(document.getElementById("txKarat").value, 10);
      if (!karat) {
        showAlert("Select a karat first to auto-fill the price.");
        return;
      }
      const purity = karat / 24;
      const priceGHS = parseFloat(
        ((SPOT_USD / 31.1035) * purity * RATE).toFixed(2),
      );
      document.getElementById("txUnitPrice").value = priceGHS;
      updateSummary();
      clearFieldError("txUnitPrice", "txUnitPriceErr");
    });

  function updateSummary() {
    const weight = parseFloat(document.getElementById("txWeight").value) || 0;
    const unitPrice =
      parseFloat(document.getElementById("txUnitPrice").value) || 0;
    document.getElementById("sumWeight").textContent = weight
      ? weight.toFixed(2) + " g"
      : "—";
    document.getElementById("sumUnit").textContent = unitPrice
      ? "GHS " + fmtMoney(unitPrice) + "/g"
      : "—";
    document.getElementById("sumTotal").textContent =
      weight && unitPrice ? "GHS " + fmtMoney(weight * unitPrice) : "—";
  }
  document.getElementById("txWeight").addEventListener("input", updateSummary);
  document
    .getElementById("txUnitPrice")
    .addEventListener("input", updateSummary);
  document.getElementById("txKarat").addEventListener("change", updateSummary);

  function showAlert(msg) {
    alertMsg.textContent = msg;
    alert.style.display = "flex";
  }
  function hideAlert() {
    alert.style.display = "none";
  }
  function setFieldError(inputId, errId, msg) {
    var el = document.getElementById(inputId);
    var err = document.getElementById(errId);
    if (el) el.classList.add("error");
    if (err) err.textContent = "⚠ " + msg;
  }
  function clearFieldError(inputId, errId) {
    var el = document.getElementById(inputId);
    var err = document.getElementById(errId);
    if (el) el.classList.remove("error");
    if (err) err.textContent = "";
  }

  ["txCustomer", "txDate", "txKarat", "txWeight", "txUnitPrice"].forEach(
    function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", function () {
        clearFieldError(id, id + "Err");
        hideAlert();
      });
      el.addEventListener("change", function () {
        clearFieldError(id, id + "Err");
        hideAlert();
      });
    },
  );

  function validate() {
    var ok = true;
    hideAlert();
    ["txCustomer", "txDate", "txKarat", "txWeight", "txUnitPrice"].forEach(
      function (id) {
        clearFieldError(id, id + "Err");
      },
    );
    if (!custInput.value.trim()) {
      setFieldError("txCustomer", "txCustomerErr", "Customer name is required");
      ok = false;
    }
    if (!document.getElementById("txDate").value) {
      setFieldError("txDate", "txDateErr", "Date is required");
      ok = false;
    }
    if (!document.getElementById("txKarat").value) {
      setFieldError("txKarat", "txKaratErr", "Select a karat grade");
      ok = false;
    }
    if (!(parseFloat(document.getElementById("txWeight").value) > 0)) {
      setFieldError("txWeight", "txWeightErr", "Enter a valid weight");
      ok = false;
    }
    if (!(parseFloat(document.getElementById("txUnitPrice").value) > 0)) {
      setFieldError(
        "txUnitPrice",
        "txUnitPriceErr",
        "Enter a valid unit price",
      );
      ok = false;
    }
    if (!ok) showAlert("Please fix the highlighted fields.");
    return ok;
  }

  submitBtn.addEventListener("click", function () {
    if (!validate()) return;
    submitBtn.classList.add("loading");
    submitBtn.disabled = true;
    setTimeout(function () {
      submitBtn.classList.remove("loading");
      submitBtn.disabled = false;
      var karat = parseInt(document.getElementById("txKarat").value, 10);
      var weight = parseFloat(document.getElementById("txWeight").value);
      var unit = parseFloat(document.getElementById("txUnitPrice").value);
      var newTx = {
        id: "TXN-" + String(TX_DATA.length + 1).padStart(4, "0"),
        date: new Date(document.getElementById("txDate").value),
        customer: custInput.value.trim(),
        type: selectedType,
        karat: karat + "K",
        weight: weight,
        unitPrice: unit,
        total: parseFloat((weight * unit).toFixed(2)),
        status: document.getElementById("txStatus").value,
      };
      TX_DATA.unshift(newTx);
      txVisible = 20;
      txSearch = "";
      renderTx();
      renderDashTx();
      showSuccess(newTx);
    }, 900);
  });

  function showSuccess(tx) {
    document.querySelector(".modal-header").style.display = "none";
    document.querySelector(".modal-body").style.display = "none";
    document.querySelector(".modal-footer").style.display = "none";
    var s = document.createElement("div");
    s.className = "modal-success show";
    s.innerHTML =
      '<div class="modal-success-circle"><i class="fa fa-check"></i></div>' +
      "<h3>Transaction Saved!</h3>" +
      "<p>" +
      tx.id +
      " · " +
      tx.type +
      " · " +
      tx.karat +
      " · " +
      tx.weight +
      "g<br>" +
      '<strong style="color:var(--gold)">GHS ' +
      fmtMoney(tx.total) +
      "</strong></p>" +
      '<div style="display:flex;gap:10px;margin-top:8px">' +
      '<button class="btn btn-outline" id="successClose">Done</button>' +
      '<button class="btn btn-gold" id="successAnother"><i class="fa fa-plus"></i> Add Another</button>' +
      "</div>";
    document.getElementById("txModal").appendChild(s);
    document
      .getElementById("successClose")
      .addEventListener("click", closeTxModal);
    document
      .getElementById("successAnother")
      .addEventListener("click", function () {
        s.remove();
        document.querySelector(".modal-header").style.display = "";
        document.querySelector(".modal-body").style.display = "";
        document.querySelector(".modal-footer").style.display = "";
        resetModal();
        document.getElementById("txDate").value = new Date()
          .toISOString()
          .split("T")[0];
      });
  }

  function resetModal() {
    selectedType = "Buy";
    document.querySelectorAll(".tx-type-btn").forEach(function (b) {
      b.classList.remove("active");
    });
    document.getElementById("typeBuy").classList.add("active");
    [
      "txCustomer",
      "txDate",
      "txKarat",
      "txWeight",
      "txUnitPrice",
      "txNotes",
    ].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = "";
    });
    document.getElementById("txStatus").value = "Complete";
    ["txCustomer", "txDate", "txKarat", "txWeight", "txUnitPrice"].forEach(
      function (id) {
        clearFieldError(id, id + "Err");
      },
    );
    hideAlert();
    custDropdown.classList.remove("open");
    document.getElementById("sumWeight").textContent = "—";
    document.getElementById("sumUnit").textContent = "—";
    document.getElementById("sumTotal").textContent = "—";
    document.querySelector(".modal-header").style.display = "";
    document.querySelector(".modal-body").style.display = "";
    document.querySelector(".modal-footer").style.display = "";
    var s = document.querySelector(".modal-success");
    if (s) s.remove();
  }
})();

// ============================================================
// SIDEBAR TOGGLE (medium & mobile screens)
// ============================================================
(function () {
  const toggleBtn = document.getElementById("sidebarToggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  function openSidebar() {
    sidebar.classList.add("mobile-open");
    overlay.classList.add("active");
    toggleBtn.classList.add("is-open");
    toggleBtn.setAttribute("aria-expanded", "true");
  }
  function closeSidebar() {
    sidebar.classList.remove("mobile-open");
    overlay.classList.remove("active");
    toggleBtn.classList.remove("is-open");
    toggleBtn.setAttribute("aria-expanded", "false");
  }
  function isMediumScreen() {
    return window.innerWidth <= 1024;
  }

  toggleBtn.addEventListener("click", function () {
    sidebar.classList.contains("mobile-open") ? closeSidebar() : openSidebar();
  });
  overlay.addEventListener("click", closeSidebar);
  sidebar.querySelectorAll(".nav-item").forEach(function (item) {
    item.addEventListener("click", function () {
      if (isMediumScreen()) closeSidebar();
    });
  });
  window.addEventListener("resize", function () {
    if (!isMediumScreen()) closeSidebar();
  });
})();
// ============================================================
// TOAST
// ============================================================
function showToast(msg, duration) {
  duration = duration || 2800;
  var t = document.getElementById("toast");
  document.getElementById("toastMsg").textContent = msg;
  t.classList.add("show");
  setTimeout(function () {
    t.classList.remove("show");
  }, duration);
}

// ============================================================
// EXPORT TO EXCEL (CSV download — works without a library)
// ============================================================
function exportToExcel(type) {
  var rows, headers, filename;

  if (type === "transactions") {
    headers = [
      "ID",
      "Date",
      "Customer",
      "Type",
      "Karat",
      "Weight (g)",
      "Unit Price (GHS)",
      "Total (GHS)",
      "Status",
    ];
    rows = filteredTx().map(function (t) {
      return [
        t.id,
        fmtDate(t.date),
        t.customer,
        t.type,
        t.karat,
        t.weight,
        t.unitPrice,
        t.total,
        t.status,
      ];
    });
    filename =
      "GoldTrack_Transactions_" +
      new Date().toISOString().slice(0, 10) +
      ".csv";
  } else if (type === "customers") {
    headers = [
      "ID",
      "Name",
      "Phone",
      "Location",
      "Total Purchases",
      "Total Spent (GHS)",
      "Tier",
      "Status",
    ];
    rows = filteredCust().map(function (c) {
      return [
        c.id,
        c.name,
        c.phone,
        c.location,
        c.purchases,
        c.spent,
        c.tier,
        c.status,
      ];
    });
    filename =
      "GoldTrack_Customers_" + new Date().toISOString().slice(0, 10) + ".csv";
  } else if (type === "receipts") {
    headers = ["Receipt No.", "Date", "Customer", "Type", "Total (GHS)"];
    rows = RECEIPT_DATA.map(function (t) {
      return [t.receiptNo, fmtDate(t.date), t.customer, t.type, t.total];
    });
    filename =
      "GoldTrack_Receipts_" + new Date().toISOString().slice(0, 10) + ".csv";
  }

  var csv = [headers]
    .concat(rows)
    .map(function (row) {
      return row
        .map(function (cell) {
          var v = String(cell).replace(/"/g, '""');
          return /[,"\n]/.test(v) ? '"' + v + '"' : v;
        })
        .join(",");
    })
    .join("\r\n");

  var blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast("Exported " + rows.length + " rows to " + filename);
}

// ============================================================
// EXPORT CURRENT REPORT (called by the Reports page Export button)
// ============================================================
var _currentReport = null; // set by openReport() in reports.js

function exportCurrentReport() {
  // Determine which report sub-panel is currently visible
  var panels = [
    "sales",
    "customers",
    "inventory",
    "pnl",
    "txlog",
    "pricehistory",
  ];
  var active = _currentReport;
  if (!active) {
    active = panels.find(function (p) {
      var el = document.getElementById("rpt-" + p);
      return el && el.style.display !== "none";
    });
  }

  if (active === "customers") {
    // Export customer report data
    var tier = (document.getElementById("custRptTier") || {}).value || "all";
    var status =
      (document.getElementById("custRptStatus") || {}).value || "all";
    var loc = (document.getElementById("custRptLocation") || {}).value || "all";
    var data = CUST_DATA.filter(function (c) {
      return (
        (tier === "all" || c.tier === tier) &&
        (status === "all" || c.status === status) &&
        (loc === "all" || c.location === loc)
      );
    });
    var headers = [
      "ID",
      "Name",
      "Phone",
      "Location",
      "Purchases",
      "Total Spent (GHS)",
      "Tier",
      "Status",
    ];
    var rows = data.map(function (c) {
      return [
        c.id,
        c.name,
        c.phone,
        c.location,
        c.purchases,
        c.spent,
        c.tier,
        c.status,
      ];
    });
    _downloadCsv(
      headers,
      rows,
      "GoldTrack_CustomerReport_" +
        new Date().toISOString().slice(0, 10) +
        ".csv",
    );
  } else if (active === "txlog" || active === "sales") {
    // Export transaction data with current filters
    var period =
      active === "sales"
        ? (document.getElementById("salesPeriod") || {}).value || "all"
        : "all";
    var karat =
      active === "sales"
        ? (document.getElementById("salesKarat") || {}).value || "all"
        : "all";
    var type =
      active === "sales"
        ? (document.getElementById("salesType") || {}).value || "all"
        : "all";
    var now = new Date();
    var data = TX_DATA.filter(function (t) {
      var inPeriod = true;
      if (period === "month")
        inPeriod =
          t.date.getMonth() === now.getMonth() &&
          t.date.getFullYear() === now.getFullYear();
      else if (period === "quarter")
        inPeriod =
          Math.floor(t.date.getMonth() / 3) ===
            Math.floor(now.getMonth() / 3) &&
          t.date.getFullYear() === now.getFullYear();
      else if (period === "year")
        inPeriod = t.date.getFullYear() === now.getFullYear();
      var inKarat = karat === "all" || t.karat === karat + "K";
      var inType = type === "all" || t.type === type;
      return inPeriod && inKarat && inType;
    });
    var label = active === "sales" ? "SalesReport" : "TransactionLog";
    var headers = [
      "ID",
      "Date",
      "Customer",
      "Type",
      "Karat",
      "Weight (g)",
      "Unit Price (GHS)",
      "Total (GHS)",
      "Status",
    ];
    var rows = data.map(function (t) {
      return [
        t.id,
        fmtDate(t.date),
        t.customer,
        t.type,
        t.karat,
        t.weight,
        t.unitPrice,
        t.total,
        t.status,
      ];
    });
    _downloadCsv(
      headers,
      rows,
      "GoldTrack_" +
        label +
        "_" +
        new Date().toISOString().slice(0, 10) +
        ".csv",
    );
  } else if (active === "inventory") {
    // Export inventory karat summary
    var karats = ["24K", "22K", "21K", "18K", "14K"];
    var headers = [
      "Karat",
      "Bought (g)",
      "Sold (g)",
      "Net Stock (g)",
      "Transactions",
    ];
    var rows = karats.map(function (k) {
      var bought = TX_DATA.filter(function (t) {
        return t.karat === k && t.type === "Buy";
      }).reduce(function (s, t) {
        return s + t.weight;
      }, 0);
      var sold = TX_DATA.filter(function (t) {
        return t.karat === k && t.type === "Sell";
      }).reduce(function (s, t) {
        return s + t.weight;
      }, 0);
      var count = TX_DATA.filter(function (t) {
        return t.karat === k;
      }).length;
      return [
        k,
        bought.toFixed(1),
        sold.toFixed(1),
        (bought - sold).toFixed(1),
        count,
      ];
    });
    _downloadCsv(
      headers,
      rows,
      "GoldTrack_InventoryReport_" +
        new Date().toISOString().slice(0, 10) +
        ".csv",
    );
  } else if (active === "pnl") {
    // Export P&L summary
    var headers = ["Month", "Revenue (GHS)", "Volume (g)", "Transactions"];
    var months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    var rows = months.map(function (m, i) {
      var txs = TX_DATA.filter(function (t) {
        return t.date.getMonth() === i;
      });
      var rev = txs.reduce(function (s, t) {
        return s + t.total;
      }, 0);
      var vol = txs.reduce(function (s, t) {
        return s + t.weight;
      }, 0);
      return [m, rev.toFixed(2), vol.toFixed(1), txs.length];
    });
    _downloadCsv(
      headers,
      rows,
      "GoldTrack_PnLReport_" + new Date().toISOString().slice(0, 10) + ".csv",
    );
  } else if (active === "pricehistory") {
    var headers = [
      "Month",
      "Open (USD/oz)",
      "High",
      "Low",
      "Close",
      "Change %",
      "Avg GHS/g (22K)",
    ];
    var basePrice = 3200;
    var monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    var rows = monthNames.map(function (m, i) {
      var open = +(basePrice + i * 12 + Math.random() * 20).toFixed(2);
      var close = +(open + (Math.random() - 0.4) * 30).toFixed(2);
      var high = +(Math.max(open, close) + Math.random() * 15).toFixed(2);
      var low = +(Math.min(open, close) - Math.random() * 15).toFixed(2);
      var chg = (((close - open) / open) * 100).toFixed(2);
      var ghsPerGram = ((close / 31.1035) * (22 / 24) * 15.32).toFixed(2);
      return [m, open, high, low, close, chg + "%", ghsPerGram];
    });
    _downloadCsv(
      headers,
      rows,
      "GoldTrack_PriceHistory_" +
        new Date().toISOString().slice(0, 10) +
        ".csv",
    );
  } else {
    // Fallback — export all transactions
    exportToExcel("transactions");
    return;
  }
}

function _downloadCsv(headers, rows, filename) {
  var csv = [headers]
    .concat(rows)
    .map(function (row) {
      return row
        .map(function (cell) {
          var v = String(cell).replace(/"/g, '""');
          return /[,"\n]/.test(v) ? '"' + v + '"' : v;
        })
        .join(",");
    })
    .join("\r\n");
  var blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Exported " + rows.length + " rows to " + filename);
}

// ============================================================
// PRINT RECEIPTS
// ============================================================
function printSelected() {
  // Build a printable receipt page from RECEIPT_DATA
  var html =
    '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
    "<title>GoldTrack — Receipts</title>" +
    "<style>" +
    "body{font-family:Arial,sans-serif;font-size:12px;color:#1c1a14;margin:0;padding:20px}" +
    "h1{font-size:18px;margin-bottom:4px}" +
    ".sub{color:#7a7060;font-size:11px;margin-bottom:20px}" +
    "table{width:100%;border-collapse:collapse;margin-bottom:32px}" +
    "th{background:#f9f2e1;padding:8px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.7px;border-bottom:2px solid #c9a84c}" +
    "td{padding:8px 12px;border-bottom:1px solid #eee;font-size:12px}" +
    "tr:last-child td{border-bottom:none}" +
    ".badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px}" +
    ".buy{background:#eaf5ee;color:#3d9a5e}.sell{background:#fbeceb;color:#c0392b}" +
    ".footer{text-align:center;font-size:10px;color:#b0a590;margin-top:40px;border-top:1px solid #eee;padding-top:12px}" +
    "</style></head><body>" +
    "<h1>GoldTrack — Transaction Receipts</h1>" +
    '<div class="sub">Printed on ' +
    new Date().toLocaleString("en-GB") +
    "</div>" +
    "<table><thead><tr>" +
    "<th>Receipt No.</th><th>Date</th><th>Customer</th><th>Type</th><th>Amount (GHS)</th>" +
    "</tr></thead><tbody>" +
    RECEIPT_DATA.map(function (t) {
      return (
        "<tr>" +
        "<td><strong>" +
        t.receiptNo +
        "</strong></td>" +
        "<td>" +
        fmtDate(t.date) +
        "</td>" +
        "<td>" +
        t.customer +
        "</td>" +
        '<td><span class="badge ' +
        t.type.toLowerCase() +
        '">' +
        t.type +
        "</span></td>" +
        "<td><strong>GHS " +
        fmtMoney(t.total) +
        "</strong></td>" +
        "</tr>"
      );
    }).join("") +
    "</tbody></table>" +
    '<div class="footer">GoldTrack Gold Management System · Confidential</div>' +
    "</body></html>";

  var w = window.open("", "_blank", "width=900,height=700");
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(function () {
    w.print();
  }, 400);
}

// Also wire individual receipt print buttons
function printReceipt(receiptNo) {
  var t = RECEIPT_DATA.find(function (r) {
    return r.receiptNo === receiptNo;
  });
  if (!t) return;

  var html =
    '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
    "<title>Receipt " +
    t.receiptNo +
    "</title>" +
    "<style>" +
    "body{font-family:Arial,sans-serif;max-width:380px;margin:40px auto;padding:24px;border:1px solid #eee;border-radius:12px;color:#1c1a14}" +
    ".logo{font-size:22px;font-weight:700;color:#c9a84c;margin-bottom:4px}" +
    ".sub{color:#7a7060;font-size:11px;margin-bottom:20px}" +
    ".rno{font-size:13px;font-weight:600;color:#9b7a2f;margin-bottom:16px}" +
    ".row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f0ede5;font-size:12px}" +
    ".row:last-child{border-bottom:none}" +
    ".label{color:#7a7060}.val{font-weight:500}" +
    ".total{font-size:16px;font-weight:700;color:#c9a84c;margin-top:16px;text-align:right}" +
    ".footer{text-align:center;font-size:10px;color:#b0a590;margin-top:24px}" +
    "</style></head><body>" +
    '<div class="logo">GoldTrack</div>' +
    '<div class="sub">Gold Management System</div>' +
    '<div class="rno">' +
    t.receiptNo +
    "</div>" +
    '<div class="row"><span class="label">Date</span><span class="val">' +
    fmtDate(t.date) +
    "</span></div>" +
    '<div class="row"><span class="label">Customer</span><span class="val">' +
    t.customer +
    "</span></div>" +
    '<div class="row"><span class="label">Type</span><span class="val">' +
    t.type +
    "</span></div>" +
    '<div class="row"><span class="label">Karat</span><span class="val">' +
    t.karat +
    "</span></div>" +
    '<div class="row"><span class="label">Weight</span><span class="val">' +
    t.weight +
    "g</span></div>" +
    '<div class="row"><span class="label">Unit Price</span><span class="val">GHS ' +
    fmtMoney(t.unitPrice) +
    "/g</span></div>" +
    '<div class="row"><span class="label">Status</span><span class="val">' +
    t.status +
    "</span></div>" +
    '<div class="total">Total: GHS ' +
    fmtMoney(t.total) +
    "</div>" +
    '<div class="footer">Thank you for your business · GoldTrack</div>' +
    "</body></html>";

  var w = window.open("", "_blank", "width=480,height=620");
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(function () {
    w.print();
  }, 400);
}

// ============================================================
// ADD CUSTOMER MODAL
// ============================================================
(function () {
  var backdrop = document.getElementById("custModalBackdrop");
  var closeBtn = document.getElementById("custModalClose");
  var cancelBtn = document.getElementById("custModalCancel");
  var submitBtn = document.getElementById("custModalSubmit");
  var alertBox = document.getElementById("custModalAlert");
  var alertMsg = document.getElementById("custModalAlertMsg");

  function openCustModal() {
    resetCustModal();
    backdrop.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeCustModal() {
    backdrop.classList.remove("open");
    document.body.style.overflow = "";
  }
  window.openCustModal = openCustModal;

  closeBtn.addEventListener("click", closeCustModal);
  cancelBtn.addEventListener("click", closeCustModal);
  backdrop.addEventListener("click", function (e) {
    if (e.target === backdrop) closeCustModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && backdrop.classList.contains("open"))
      closeCustModal();
  });

  function showAlert(msg) {
    alertMsg.textContent = msg;
    alertBox.style.display = "flex";
  }
  function hideAlert() {
    alertBox.style.display = "none";
  }

  function setErr(id, msg) {
    var el = document.getElementById(id);
    var er = document.getElementById(id + "Err");
    if (el) el.classList.add("error");
    if (er) er.textContent = "⚠ " + msg;
  }
  function clearErr(id) {
    var el = document.getElementById(id);
    var er = document.getElementById(id + "Err");
    if (el) el.classList.remove("error");
    if (er) er.textContent = "";
  }

  ["custFirstName", "custLastName", "custPhone", "custLocation"].forEach(
    function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", function () {
        clearErr(id);
        hideAlert();
      });
      el.addEventListener("change", function () {
        clearErr(id);
        hideAlert();
      });
    },
  );

  function validate() {
    var ok = true;
    hideAlert();
    ["custFirstName", "custLastName", "custPhone", "custLocation"].forEach(
      clearErr,
    );

    if (!document.getElementById("custFirstName").value.trim()) {
      setErr("custFirstName", "First name is required");
      ok = false;
    }
    if (!document.getElementById("custLastName").value.trim()) {
      setErr("custLastName", "Last name is required");
      ok = false;
    }

    var phone = document.getElementById("custPhone").value.trim();
    if (!phone) {
      setErr("custPhone", "Phone number is required");
      ok = false;
    }

    if (!document.getElementById("custLocation").value) {
      setErr("custLocation", "Select a location");
      ok = false;
    }

    if (!ok) showAlert("Please fix the highlighted fields.");
    return ok;
  }

  submitBtn.addEventListener("click", function () {
    if (!validate()) return;
    submitBtn.classList.add("loading");
    submitBtn.disabled = true;

    setTimeout(function () {
      submitBtn.classList.remove("loading");
      submitBtn.disabled = false;

      var first = document.getElementById("custFirstName").value.trim();
      var last = document.getElementById("custLastName").value.trim();
      var fullName = first + " " + last;
      var initials = (first[0] + last[0]).toUpperCase();

      var newCust = {
        id: "CUST-" + String(CUST_DATA.length + 1).padStart(3, "0"),
        name: fullName,
        initials: initials,
        phone: document.getElementById("custPhone").value.trim(),
        location: document.getElementById("custLocation").value,
        purchases: 0,
        spent: 0,
        tier: "Bronze",
        status: document.getElementById("custStatus").value,
      };

      CUST_DATA.unshift(newCust);
      custVisible = 20;
      custSearch = "";
      document.getElementById("custSearch").value = "";
      renderCust();

      closeCustModal();
      showToast('Customer "' + fullName + '" added successfully!');
    }, 700);
  });

  function resetCustModal() {
    [
      "custFirstName",
      "custLastName",
      "custPhone",
      "custEmail",
      "custNotes",
    ].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = "";
    });
    document.getElementById("custLocation").value = "";
    document.getElementById("custStatus").value = "Active";
    ["custFirstName", "custLastName", "custPhone", "custLocation"].forEach(
      clearErr,
    );
    hideAlert();

    // Restore modal panels if coming from a prior success
    var s = document.querySelector("#custModal .modal-success");
    if (s) s.remove();
    document.querySelector("#custModal .modal-header").style.display = "";
    document.querySelector("#custModal .modal-body").style.display = "";
    document.querySelector("#custModal .modal-footer").style.display = "";
  }
})();

// ============================================================
// RECEIPT SEARCH
// ============================================================
document.getElementById("receiptSearch").addEventListener("input", function () {
  receiptSearch = this.value;
  renderReceipts();
});

// ============================================================
// TRACK CURRENT REPORT (so exportCurrentReport knows what to export)
// Wraps openReport / showReportHome defined in reports.js
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
  // Patch after reports.js has loaded
  setTimeout(function () {
    var _origOpen = window.openReport;
    if (typeof _origOpen === "function") {
      window.openReport = function (type) {
        _currentReport = type;
        _origOpen(type);
      };
    }
    var _origHome = window.showReportHome;
    if (typeof _origHome === "function") {
      window.showReportHome = function () {
        _currentReport = null;
        _origHome();
      };
    }
  }, 300);
});
