// ============================================================
// REPORTS ENGINE
// ============================================================

// ── Chart registry (destroy before recreating) ──
const RPT_CHARTS = {};
function rptChart(id, config) {
  if (RPT_CHARTS[id]) { RPT_CHARTS[id].destroy(); delete RPT_CHARTS[id]; }
  const ctx = document.getElementById(id);
  if (!ctx) return;
  RPT_CHARTS[id] = new Chart(ctx, config);
}

function rptTheme() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    grid: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    text: dark ? '#9A9080' : '#7A7060',
    tooltip: { backgroundColor: 'rgba(26,21,16,.95)', titleColor: '#C9A84C', bodyColor: '#C8BFA8' }
  };
}

// ── Navigation ──
let currentReport = null;
function openReport(id) {
  document.getElementById('rpt-home').style.display = 'none';
  ['sales','customers','inventory','pnl','txlog','pricehistory'].forEach(r => {
    const el = document.getElementById('rpt-' + r);
    if (el) el.style.display = 'none';
  });
  const panel = document.getElementById('rpt-' + id);
  if (panel) panel.style.display = 'block';
  document.getElementById('rptBackBtn').style.display  = '';
  document.getElementById('rptExportBtn').style.display = '';
  document.getElementById('rptPrintBtn').style.display  = '';
  currentReport = id;

  const renderers = {
    sales: renderSalesReport,
    customers: renderCustomerReport,
    inventory: renderInventoryReport,
    pnl: renderPnlReport,
    txlog: renderTxLog,
    pricehistory: renderPriceHistory
  };
  if (renderers[id]) setTimeout(renderers[id], 30);
}
function showReportHome() {
  ['sales','customers','inventory','pnl','txlog','pricehistory'].forEach(r => {
    const el = document.getElementById('rpt-' + r);
    if (el) el.style.display = 'none';
  });
  document.getElementById('rpt-home').style.display = '';
  document.getElementById('rptBackBtn').style.display  = 'none';
  document.getElementById('rptExportBtn').style.display = 'none';
  document.getElementById('rptPrintBtn').style.display  = 'none';
  currentReport = null;
  setTimeout(initCharts, 50);
}
function exportCurrentReport() {
  exportToExcel(currentReport || 'transactions');
}

// ── KPI helper ──
function kpiCard(label, val, change, changeClass, accent) {
  return `<div class="rpt-kpi${accent?' accent':''}">
    <div class="rpt-kpi-label">${label}</div>
    <div class="rpt-kpi-val">${val}</div>
    ${change ? `<div class="rpt-kpi-change ${changeClass}">${change}</div>` : ''}
  </div>`;
}

// ============================================================
// 1. SALES REPORT
// ============================================================
function getSalesData() {
  const period = document.getElementById('salesPeriod')?.value || 'year';
  const karat  = document.getElementById('salesKarat')?.value || 'all';
  const type   = document.getElementById('salesType')?.value  || 'all';
  let data = [...TX_DATA];
  if (karat !== 'all') data = data.filter(t => t.karat === karat + 'K');
  if (type  !== 'all') data = data.filter(t => t.type === type);
  if (period === 'month') {
    const now = new Date(); data = data.filter(t => t.date.getMonth() === now.getMonth() && t.date.getFullYear() === now.getFullYear());
  } else if (period === 'quarter') {
    const now = new Date(); const q = Math.floor(now.getMonth()/3);
    data = data.filter(t => Math.floor(t.date.getMonth()/3) === q && t.date.getFullYear() === now.getFullYear());
  } else if (period === 'year') {
    data = data.filter(t => t.date.getFullYear() === 2024);
  }
  return data;
}

function renderSalesReport() {
  const data = getSalesData();
  const t = rptTheme();

  // KPIs
  const totalRev = data.reduce((s, t) => s + t.total, 0);
  const totalVol = data.reduce((s, t) => s + t.weight, 0);
  const sells    = data.filter(t => t.type === 'Sell');
  const buys     = data.filter(t => t.type === 'Buy');
  document.getElementById('salesKpiRow').innerHTML =
    kpiCard('Total Revenue', 'GHS ' + fmtMoney(totalRev), '<i class="fa fa-arrow-trend-up"></i> +8.7% vs last year', 'up', true) +
    kpiCard('Total Volume', fmtMoney(totalVol) + 'g', data.length + ' transactions', 'neutral') +
    kpiCard('Sell Revenue', 'GHS ' + fmtMoney(sells.reduce((s,t)=>s+t.total,0)), sells.length + ' sell orders', 'up') +
    kpiCard('Buy Revenue', 'GHS ' + fmtMoney(buys.reduce((s,t)=>s+t.total,0)), buys.length + ' buy orders', 'neutral') +
    kpiCard('Avg Transaction', 'GHS ' + (data.length ? fmtMoney(totalRev/data.length) : '0'), 'per transaction', 'neutral');

  // Monthly revenue chart
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthly = months.map((_,i) => data.filter(d => d.date.getMonth()===i).reduce((s,d)=>s+d.total,0));
  rptChart('salesRevenueChart', {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{
        label: 'Revenue (GHS)', data: monthly,
        backgroundColor: monthly.map(v => v > 0 ? 'rgba(201,168,76,0.75)' : 'rgba(201,168,76,0.2)'),
        borderRadius: 5
      }]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:false}, tooltip:rptTheme().tooltip },
      scales:{ x:{grid:{color:t.grid},ticks:{color:t.text}}, y:{grid:{color:t.grid},ticks:{color:t.text,callback:v=>'₵'+v.toLocaleString()}} } }
  });

  // Karat donut
  const karats = ['24K','22K','21K','18K','14K'];
  const karatVol = karats.map(k => data.filter(d=>d.karat===k).reduce((s,d)=>s+d.weight,0));
  rptChart('salesKaratChart', {
    type: 'doughnut',
    data: { labels: karats, datasets:[{ data: karatVol,
      backgroundColor:['rgba(201,168,76,0.9)','rgba(93,189,122,0.85)','rgba(36,113,163,0.85)','rgba(136,78,160,0.85)','rgba(211,84,0,0.85)'],
      borderWidth:0, hoverOffset:6 }] },
    options: { responsive:true, maintainAspectRatio:false, cutout:'68%',
      plugins:{ legend:{position:'bottom',labels:{color:t.text,boxWidth:10,padding:10}}, tooltip:rptTheme().tooltip } }
  });

  renderSalesTable();
}

let salesTableVisible = 20;
function renderSalesTable() {
  salesTableVisible = 20;
  const q = (document.getElementById('salesSearch')?.value || '').toLowerCase();
  let data = getSalesData().filter(t =>
    !q || t.customer.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || t.type.toLowerCase().includes(q)
  );
  document.getElementById('salesTableCount').textContent = data.length;
  document.getElementById('salesTableBody').innerHTML = data.slice(0, salesTableVisible).map(t => `<tr>
    <td>${fmtDate(t.date)}</td>
    <td>${t.customer}</td>
    <td><span class="badge ${t.type==='Buy'?'badge-buy':'badge-sell'}">${t.type}</span></td>
    <td>${t.karat}</td>
    <td>${t.weight}g</td>
    <td>GHS ${fmtMoney(t.unitPrice)}</td>
    <td style="font-weight:500">GHS ${fmtMoney(t.total)}</td>
    <td><span class="badge ${t.status==='Complete'?'badge-complete':'badge-pending'}">${t.status}</span></td>
  </tr>`).join('') || '<tr><td colspan="8"><div class="empty-state"><i class="fa fa-search"></i>No records found</div></td></tr>';
}

// ============================================================
// 2. CUSTOMER REPORT
// ============================================================
function renderCustomerReport() {
  const tier     = document.getElementById('custRptTier')?.value     || 'all';
  const status   = document.getElementById('custRptStatus')?.value   || 'all';
  const location = document.getElementById('custRptLocation')?.value || 'all';
  const q        = (document.getElementById('custRptSearch')?.value  || '').toLowerCase();

  let data = [...CUST_DATA];
  if (tier     !== 'all') data = data.filter(c => c.tier === tier);
  if (status   !== 'all') data = data.filter(c => c.status === status);
  if (location !== 'all') data = data.filter(c => c.location === location);
  if (q) data = data.filter(c => c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q));

  const t = rptTheme();
  const totalSpent = data.reduce((s,c)=>s+c.spent,0);
  const vips = data.filter(c=>c.tier==='VIP').length;
  const active = data.filter(c=>c.status==='Active').length;

  document.getElementById('custKpiRow').innerHTML =
    kpiCard('Total Customers', data.length, `${active} active`, 'up', true) +
    kpiCard('Total Revenue', 'GHS ' + fmtMoney(totalSpent), 'from filtered clients', 'up') +
    kpiCard('VIP Clients', vips, (vips/data.length*100||0).toFixed(1)+'% of total', 'up') +
    kpiCard('Avg Spend/Client', 'GHS ' + (data.length?fmtMoney(totalSpent/data.length):'0'), 'per customer', 'neutral') +
    kpiCard('Active Rate', (data.length?(active/data.length*100).toFixed(1):0)+'%', active + ' active clients', 'up');

  // Tier chart
  const tierLabels = ['VIP','Gold','Silver','Bronze'];
  const tierCounts = tierLabels.map(tl => data.filter(c=>c.tier===tl).length);
  rptChart('custTierChart', {
    type:'doughnut',
    data:{labels:tierLabels, datasets:[{data:tierCounts, backgroundColor:['rgba(201,168,76,0.9)','rgba(255,190,60,0.85)','rgba(170,170,170,0.85)','rgba(150,90,40,0.75)'], borderWidth:0, hoverOffset:5}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{legend:{position:'bottom',labels:{color:t.text,boxWidth:10,padding:8}},tooltip:rptTheme().tooltip}}
  });

  // Location chart
  const locMap = {};
  data.forEach(c=>{locMap[c.location]=(locMap[c.location]||0)+1;});
  const locSorted = Object.entries(locMap).sort((a,b)=>b[1]-a[1]).slice(0,6);
  rptChart('custLocationChart', {
    type:'bar',
    data:{labels:locSorted.map(l=>l[0]),datasets:[{label:'Customers',data:locSorted.map(l=>l[1]),backgroundColor:'rgba(36,113,163,0.75)',borderRadius:4}]},
    options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',plugins:{legend:{display:false},tooltip:rptTheme().tooltip},scales:{x:{grid:{color:t.grid},ticks:{color:t.text}},y:{grid:{display:false},ticks:{color:t.text}}}}
  });

  // Status chart
  rptChart('custStatusChart', {
    type:'doughnut',
    data:{labels:['Active','Inactive'],datasets:[{data:[active,data.length-active],backgroundColor:['rgba(93,189,122,0.85)','rgba(192,57,43,0.7)'],borderWidth:0,hoverOffset:5}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{legend:{position:'bottom',labels:{color:t.text,boxWidth:10,padding:8}},tooltip:rptTheme().tooltip}}
  });

  // Table
  document.getElementById('custRptCount').textContent = data.length;
  const tierColors = {VIP:'badge-sell',Gold:'badge-pending',Silver:'badge-active',Bronze:'badge-inactive'};
  document.getElementById('custRptBody').innerHTML = data.slice(0,50).map(c=>`<tr>
    <td><div style="display:flex;align-items:center;gap:10px"><div class="cust-av">${c.initials}</div><div style="font-weight:500">${c.name}</div></div></td>
    <td>${c.location}</td>
    <td style="text-align:center">${c.purchases}</td>
    <td style="font-weight:500">GHS ${fmtMoney(c.spent)}</td>
    <td>GHS ${fmtMoney(c.spent/c.purchases)}</td>
    <td><span class="badge ${tierColors[c.tier]}">${c.tier}</span></td>
    <td><span class="badge ${c.status==='Active'?'badge-active':'badge-inactive'}">${c.status}</span></td>
  </tr>`).join('') || '<tr><td colspan="7"><div class="empty-state"><i class="fa fa-search"></i>No customers found</div></td></tr>';
}

// ============================================================
// 3. INVENTORY REPORT
// ============================================================
function renderInventoryReport() {
  const t = rptTheme();
  const karats = ['24K','22K','21K','18K','14K','10K','9K'];
  const purity  = {24:1,22:.9167,21:.875,18:.75,14:.583,10:.417,9:.375};

  const inv = karats.map(k => {
    const kNum = parseInt(k);
    const bought = TX_DATA.filter(t=>t.karat===k&&t.type==='Buy').reduce((s,t)=>s+t.weight,0);
    const sold   = TX_DATA.filter(t=>t.karat===k&&t.type==='Sell').reduce((s,t)=>s+t.weight,0);
    const net    = +(bought - sold).toFixed(2);
    const ghsVal = +(net * goldPricePerGram(kNum,'GHS')).toFixed(2);
    const usdVal = +(net * goldPricePerGram(kNum,'USD')).toFixed(2);
    return { k, kNum, bought:+bought.toFixed(2), sold:+sold.toFixed(2), net, ghsVal, usdVal };
  });

  const totalNet = inv.reduce((s,i)=>s+Math.max(i.net,0),0);
  const totalGhs = inv.reduce((s,i)=>s+(i.net>0?i.ghsVal:0),0);
  const totalUsd = inv.reduce((s,i)=>s+(i.net>0?i.usdVal:0),0);

  document.getElementById('invKpiRow').innerHTML =
    kpiCard('Total Stock', fmtMoney(totalNet)+'g', 'across all karats', 'neutral', true) +
    kpiCard('Stock Value (GHS)', 'GHS ' + fmtMoney(totalGhs), 'at current spot price', 'up') +
    kpiCard('Stock Value (USD)', '$' + fmtMoney(totalUsd), 'XAU/USD ' + SPOT_USD, 'up') +
    kpiCard('Total Bought', fmtMoney(TX_DATA.filter(t=>t.type==='Buy').reduce((s,t)=>s+t.weight,0))+'g', 'all time', 'neutral') +
    kpiCard('Total Sold', fmtMoney(TX_DATA.filter(t=>t.type==='Sell').reduce((s,t)=>s+t.weight,0))+'g', 'all time', 'neutral');

  // Bar chart
  rptChart('invKaratBarChart', {
    type:'bar',
    data:{labels:inv.map(i=>i.k),datasets:[
      {label:'Bought (g)',data:inv.map(i=>i.bought),backgroundColor:'rgba(93,189,122,0.75)',borderRadius:4},
      {label:'Sold (g)',data:inv.map(i=>i.sold),backgroundColor:'rgba(201,168,76,0.75)',borderRadius:4},
      {label:'Net Stock (g)',data:inv.map(i=>Math.max(i.net,0)),backgroundColor:'rgba(36,113,163,0.7)',borderRadius:4}
    ]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:t.text,boxWidth:10}},tooltip:rptTheme().tooltip},
      scales:{x:{grid:{color:t.grid},ticks:{color:t.text}},y:{grid:{color:t.grid},ticks:{color:t.text,callback:v=>v+'g'}}}}
  });

  // Donut
  const positiveInv = inv.filter(i=>i.net>0);
  rptChart('invDonutChart', {
    type:'doughnut',
    data:{labels:positiveInv.map(i=>i.k),datasets:[{data:positiveInv.map(i=>i.net),
      backgroundColor:['rgba(201,168,76,0.9)','rgba(93,189,122,0.85)','rgba(36,113,163,0.85)','rgba(136,78,160,0.8)','rgba(211,84,0,0.8)'],
      borderWidth:0,hoverOffset:5}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'65%',
      plugins:{legend:{position:'bottom',labels:{color:t.text,boxWidth:10,padding:8}},tooltip:rptTheme().tooltip}}
  });

  // Inventory table
  document.getElementById('invTableBody').innerHTML = inv.map(i=>{
    const statusClass = i.net > 50 ? 'inv-status-ok' : i.net > 0 ? 'inv-status-low' : 'inv-status-out';
    const statusText  = i.net > 50 ? '✓ In Stock' : i.net > 0 ? '⚠ Low' : '✗ Out';
    return `<tr>
      <td style="font-weight:600;color:var(--gold)">${i.k}</td>
      <td>${(purity[i.kNum]*100).toFixed(1)}%</td>
      <td>${fmtMoney(i.bought)}g</td>
      <td>${fmtMoney(i.sold)}g</td>
      <td style="font-weight:600">${fmtMoney(Math.max(i.net,0))}g</td>
      <td>GHS ${fmtMoney(i.ghsVal>0?i.ghsVal:0)}</td>
      <td>$${fmtMoney(i.usdVal>0?i.usdVal:0)}</td>
      <td class="${statusClass}">${statusText}</td>
    </tr>`;
  }).join('');

  // Movement table (last 15 buy/sell tx sorted by date)
  const movements = TX_DATA.slice(0,15);
  let running = totalNet;
  document.getElementById('invMovementBody').innerHTML = movements.map(tx=>{
    const dir = tx.type === 'Buy' ? '+' : '-';
    const cls = tx.type === 'Buy' ? 'color:var(--success)' : 'color:var(--danger)';
    running += tx.type === 'Buy' ? -tx.weight : tx.weight;
    return `<tr>
      <td>${fmtDate(tx.date)}</td>
      <td>${tx.karat}</td>
      <td><span class="badge ${tx.type==='Buy'?'badge-buy':'badge-sell'}">${tx.type}</span></td>
      <td style="${cls}">${dir}${tx.weight}g</td>
      <td>${tx.customer}</td>
      <td style="font-weight:500">${fmtMoney(Math.max(running,0))}g</td>
    </tr>`;
  }).join('');
}

// ============================================================
// 4. PROFIT & LOSS
// ============================================================
const months12 = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function renderPnlReport() {
  const t = rptTheme();
  const costModel = document.getElementById('pnlCostModel')?.value || 'fixed';
  const data = TX_DATA.filter(tx => tx.date.getFullYear() === 2024);

  const monthly = months12.map((_,mi) => {
    const txs    = data.filter(tx => tx.date.getMonth() === mi);
    const rev    = txs.reduce((s,tx)=>s+tx.total,0);
    const cost   = costModel==='fixed' ? rev/1.224 : rev * 0.8;
    const profit = rev - cost;
    const margin = rev ? (profit/rev*100) : 0;
    const vol    = txs.reduce((s,tx)=>s+tx.weight,0);
    return { month: months12[mi], rev, cost, profit, margin, count: txs.length, vol };
  });

  const totRev    = monthly.reduce((s,m)=>s+m.rev,0);
  const totCost   = monthly.reduce((s,m)=>s+m.cost,0);
  const totProfit = monthly.reduce((s,m)=>s+m.profit,0);
  const avgMargin = totRev ? (totProfit/totRev*100) : 0;

  document.getElementById('pnlKpiRow').innerHTML =
    kpiCard('Total Revenue', 'GHS ' + fmtMoney(totRev), '<i class="fa fa-arrow-trend-up"></i> Full year 2024', 'up', true) +
    kpiCard('Total Cost', 'GHS ' + fmtMoney(totCost), 'Cost of goods', 'neutral') +
    kpiCard('Gross Profit', 'GHS ' + fmtMoney(totProfit), '+' + avgMargin.toFixed(1)+'% margin', 'up') +
    kpiCard('Avg Margin', avgMargin.toFixed(1)+'%', 'across all months', 'up') +
    kpiCard('Best Month', monthly.reduce((a,b)=>b.profit>a.profit?b:a).month, 'highest profit', 'up');

  // Bar chart
  rptChart('pnlBarChart', {
    type: 'bar',
    data: { labels: months12, datasets: [
      { label:'Revenue',  data:monthly.map(m=>m.rev),    backgroundColor:'rgba(201,168,76,0.75)', borderRadius:4 },
      { label:'Cost',     data:monthly.map(m=>m.cost),   backgroundColor:'rgba(192,57,43,0.65)',  borderRadius:4 },
      { label:'Profit',   data:monthly.map(m=>m.profit), backgroundColor:'rgba(93,189,122,0.75)', borderRadius:4 }
    ]},
    options:{ responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{labels:{color:t.text,boxWidth:10}}, tooltip:rptTheme().tooltip },
      scales:{ x:{grid:{color:t.grid},ticks:{color:t.text}}, y:{grid:{color:t.grid},ticks:{color:t.text,callback:v=>'₵'+v.toLocaleString()}} } }
  });

  // Margin line chart
  rptChart('pnlMarginChart', {
    type:'line',
    data:{ labels:months12, datasets:[{ label:'Margin %', data:monthly.map(m=>+m.margin.toFixed(2)),
      borderColor:'#C9A84C', backgroundColor:'rgba(201,168,76,0.12)', fill:true, tension:.4, borderWidth:2, pointRadius:3 }]},
    options:{ responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false}, tooltip:rptTheme().tooltip },
      scales:{ x:{grid:{color:t.grid},ticks:{color:t.text}}, y:{grid:{color:t.grid},ticks:{color:t.text,callback:v=>v+'%'}} } }
  });

  // Table
  document.getElementById('pnlTableBody').innerHTML = monthly.map(m=>`<tr>
    <td style="font-weight:600">${m.month}</td>
    <td>GHS ${fmtMoney(m.rev)}</td>
    <td>GHS ${fmtMoney(m.cost)}</td>
    <td class="${m.profit>=0?'pnl-profit':'pnl-loss'}">GHS ${fmtMoney(m.profit)}</td>
    <td class="${m.margin>=0?'pnl-profit':'pnl-loss'}">${m.margin.toFixed(1)}%</td>
    <td style="text-align:center">${m.count}</td>
    <td>${fmtMoney(m.vol)}g</td>
  </tr>`).join('');
}

// ============================================================
// 5. TRANSACTION LOG
// ============================================================
let txlogVisible = 30;

function getTxLogData() {
  const from   = document.getElementById('txlogFrom')?.value;
  const to     = document.getElementById('txlogTo')?.value;
  const type   = document.getElementById('txlogType')?.value   || 'all';
  const status = document.getElementById('txlogStatus')?.value || 'all';
  const karat  = document.getElementById('txlogKarat')?.value  || 'all';
  const q      = (document.getElementById('txlogSearch')?.value || '').toLowerCase();

  return TX_DATA.filter(tx => {
    if (type   !== 'all' && tx.type   !== type)   return false;
    if (status !== 'all' && tx.status !== status) return false;
    if (karat  !== 'all' && tx.karat  !== karat)  return false;
    if (from && tx.date < new Date(from)) return false;
    if (to   && tx.date > new Date(to))  return false;
    if (q && !tx.customer.toLowerCase().includes(q) && !tx.id.toLowerCase().includes(q)) return false;
    return true;
  });
}

function renderTxLog() {
  txlogVisible = 30;
  const data = getTxLogData();
  const t = rptTheme();

  const totalRev = data.reduce((s,t)=>s+t.total,0);
  const totalVol = data.reduce((s,t)=>s+t.weight,0);
  const complete = data.filter(t=>t.status==='Complete').length;
  const pending  = data.filter(t=>t.status==='Pending').length;

  document.getElementById('txlogKpiRow').innerHTML =
    kpiCard('Records Found', data.length, 'matching filters', 'neutral', true) +
    kpiCard('Total Value', 'GHS ' + fmtMoney(totalRev), 'sum of filtered', 'up') +
    kpiCard('Total Volume', fmtMoney(totalVol)+'g', 'gold traded', 'neutral') +
    kpiCard('Complete', complete, (data.length?(complete/data.length*100).toFixed(0):0)+'% of total', 'up') +
    kpiCard('Pending', pending, pending > 0 ? 'needs attention' : 'all clear', pending>0?'down':'up');

  renderTxLogTable(data);
}

function renderTxLogTable(data) {
  const show = data.slice(0, txlogVisible);
  document.getElementById('txlogCount').textContent = data.length;
  document.getElementById('txlogBody').innerHTML = show.map(tx=>`<tr>
    <td style="font-weight:500;color:var(--gold)">${tx.id}</td>
    <td>${fmtDate(tx.date)}</td>
    <td>${tx.customer}</td>
    <td><span class="badge ${tx.type==='Buy'?'badge-buy':'badge-sell'}">${tx.type}</span></td>
    <td>${tx.karat}</td>
    <td>${tx.weight}g</td>
    <td>GHS ${fmtMoney(tx.unitPrice)}</td>
    <td style="font-weight:600">GHS ${fmtMoney(tx.total)}</td>
    <td><span class="badge ${tx.status==='Complete'?'badge-complete':'badge-pending'}">${tx.status}</span></td>
  </tr>`).join('') || '<tr><td colspan="9"><div class="empty-state"><i class="fa fa-search"></i>No transactions match your filters</div></td></tr>';

  const loadBtn = document.getElementById('txlogLoadMore');
  document.getElementById('txlogInfo').textContent = `Showing ${Math.min(show.length,data.length)} of ${data.length}`;
  if (txlogVisible >= data.length) { loadBtn.disabled=true; loadBtn.textContent='All loaded'; }
  else { loadBtn.disabled=false; loadBtn.textContent=`Load More (${Math.min(20,data.length-txlogVisible)} more)`; }
}

function txlogLoadMore() {
  txlogVisible += 20;
  renderTxLogTable(getTxLogData());
}

// Set default date range for tx log (full 2024)
function initTxLogDates() {
  const fromEl = document.getElementById('txlogFrom');
  const toEl   = document.getElementById('txlogTo');
  if (fromEl && !fromEl.value) fromEl.value = '2024-01-01';
  if (toEl   && !toEl.value)   toEl.value   = '2024-12-31';
}

// ============================================================
// 6. PRICE HISTORY
// ============================================================
// Simulate 12 months of XAU/USD price history
const PH_BASE = [
  {m:'Jan',open:2063,high:2088,low:2018,close:2043},
  {m:'Feb',open:2043,high:2082,low:1993,close:2052},
  {m:'Mar',open:2052,high:2236,low:2049,close:2232},
  {m:'Apr',open:2232,high:2392,low:2228,close:2346},
  {m:'May',open:2346,high:2449,low:2277,close:2327},
  {m:'Jun',open:2327,high:2366,low:2282,close:2326},
  {m:'Jul',open:2326,high:2484,low:2316,close:2448},
  {m:'Aug',open:2448,high:2530,low:2402,close:2503},
  {m:'Sep',open:2503,high:2686,low:2490,close:2635},
  {m:'Oct',open:2635,high:2787,low:2605,close:2746},
  {m:'Nov',open:2746,high:2790,low:2536,close:2650},
  {m:'Dec',open:2650,high:3108,low:2630,close:3063},
];

function renderPriceHistory() {
  const range    = document.getElementById('phRange')?.value    || '6m';
  const currency = document.getElementById('phCurrency')?.value || 'USD';
  const karat    = parseInt(document.getElementById('phKarat')?.value || '22');
  const t        = rptTheme();

  const months = range==='1m'?1:range==='3m'?3:range==='6m'?6:12;
  const data   = PH_BASE.slice(12-months);
  const purity = {24:1,22:.9167,21:.875,18:.75}[karat];

  // Convert if GHS/g
  const convert = v => currency==='USD' ? v : +(v/31.1035*purity*RATE).toFixed(2);
  const symb    = currency==='USD' ? '$' : '₵';
  const unit    = currency==='USD' ? 'USD/oz' : 'GHS/g';

  // Avg tx price for karat overlay
  const karatStr = karat+'K';
  const txAvg    = data.map((_,i) => {
    const mi = 12-months+i;
    const txs = TX_DATA.filter(tx=>tx.karat===karatStr && tx.date.getMonth()===mi);
    const avg  = txs.length ? txs.reduce((s,tx)=>s+tx.unitPrice,0)/txs.length : null;
    return avg !== null ? +(avg*(currency==='USD'?1/RATE:1)).toFixed(2) : null;
  });

  document.getElementById('phChartSub').textContent =
    `XAU/USD — last ${months} months with your ${karat}K transaction prices (${unit})`;

  // KPIs
  const first = convert(data[0].open);
  const last  = convert(data[data.length-1].close);
  const high  = Math.max(...data.map(d=>convert(d.high)));
  const low   = Math.min(...data.map(d=>convert(d.low)));
  const chg   = +((last-first)/first*100).toFixed(2);

  document.getElementById('phKpiRow').innerHTML =
    kpiCard('Current Price', symb+fmtMoney(last), (chg>0?'+':'')+chg+'% period change', chg>=0?'up':'down', true) +
    kpiCard('Period High',   symb+fmtMoney(high),  'all-time high in range', 'up') +
    kpiCard('Period Low',    symb+fmtMoney(low),   'all-time low in range', 'down') +
    kpiCard('Period Change', (chg>0?'+':'')+chg+'%', `${symb+fmtMoney(first)} → ${symb+fmtMoney(last)}`, chg>=0?'up':'down') +
    kpiCard('Your '+karat+'K Avg', txAvg.filter(Boolean).length ? symb+fmtMoney(txAvg.filter(Boolean).reduce((s,v)=>s+v,0)/txAvg.filter(Boolean).length) : '—', 'avg transaction price', 'neutral');

  // Main chart
  rptChart('phMainChart', {
    type:'line',
    data:{ labels: data.map(d=>d.m), datasets:[
      { label:`Close (${unit})`, data: data.map(d=>convert(d.close)), borderColor:'#C9A84C', backgroundColor:'rgba(201,168,76,0.1)', fill:true, tension:.4, borderWidth:2.5, pointRadius:4 },
      { label:`${karat}K Avg Tx Price`, data: txAvg, borderColor:'#5DBD7A', backgroundColor:'rgba(93,189,122,0.07)', borderDash:[5,4], borderWidth:2, pointRadius:5, tension:.3 }
    ]},
    options:{ responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{labels:{color:t.text,boxWidth:10}}, tooltip:rptTheme().tooltip },
      scales:{ x:{grid:{color:t.grid},ticks:{color:t.text}}, y:{grid:{color:t.grid},ticks:{color:t.text,callback:v=>symb+v.toLocaleString()}} } }
  });

  // Monthly avg bar
  rptChart('phMonthlyAvgChart', {
    type:'bar',
    data:{ labels: data.map(d=>d.m), datasets:[{
      label:'Monthly Avg (USD/oz)',
      data: data.map(d=>+((d.high+d.low)/2).toFixed(2)),
      backgroundColor:'rgba(201,168,76,0.7)', borderRadius:4
    }]},
    options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false},tooltip:rptTheme().tooltip},
      scales:{ x:{grid:{color:t.grid},ticks:{color:t.text}}, y:{grid:{color:t.grid},ticks:{color:t.text,callback:v=>'$'+v.toLocaleString()}} } }
  });

  // Vs Tx chart
  rptChart('phVsTxChart', {
    type:'line',
    data:{ labels: data.map(d=>d.m), datasets:[
      { label:'Spot GHS/g', data: data.map(d=>+(convert(d.close)).toFixed(2)), borderColor:'#C9A84C', backgroundColor:'transparent', borderWidth:2, tension:.4, pointRadius:3 },
      { label:'Your Avg', data: txAvg, borderColor:'#5DBD7A', backgroundColor:'transparent', borderWidth:2, tension:.4, pointRadius:4 }
    ]},
    options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{labels:{color:t.text,boxWidth:10}},tooltip:rptTheme().tooltip},
      scales:{ x:{grid:{color:t.grid},ticks:{color:t.text}}, y:{grid:{color:t.grid},ticks:{color:t.text,callback:v=>symb+v}} } }
  });

  // Table
  document.getElementById('phTableBody').innerHTML = data.map((d,i)=>{
    const prev   = i>0?data[i-1].close:d.open;
    const chgRow = +(d.close-prev).toFixed(2);
    const pctRow = +((chgRow/prev)*100).toFixed(2);
    const ghsG   = +(d.close/31.1035*purity*RATE).toFixed(2);
    const txRow  = txAvg[i];
    return `<tr>
      <td style="font-weight:600">${d.m}</td>
      <td>$${fmtMoney(d.open)}</td>
      <td>$${fmtMoney(d.high)}</td>
      <td>$${fmtMoney(d.low)}</td>
      <td style="font-weight:600">$${fmtMoney(d.close)}</td>
      <td class="${chgRow>=0?'ph-up':'ph-dn'}">${chgRow>=0?'+':''}${chgRow} (${pctRow>=0?'+':''}${pctRow}%)</td>
      <td>₵${fmtMoney(ghsG)}</td>
      <td>${txRow ? '₵'+fmtMoney(txRow) : '<span style="color:var(--text3)">—</span>'}</td>
    </tr>`;
  }).join('');
}

// ── Wire report card clicks & init tx log dates on page load ──
document.addEventListener('DOMContentLoaded', () => {
  initTxLogDates();
});
// In case DOMContentLoaded already fired:
if (document.readyState !== 'loading') initTxLogDates();
