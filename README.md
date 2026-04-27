# GoldTrack — Gold Management System

[GoldTrack](https://revominds.github.io/GoldTrack-MS/)


> The all-in-one platform built for gold traders in Ghana and beyond — real-time market prices, transaction management, and deep customer insights.

---

## Overview

GoldTrack is a web-based gold trading management system designed for gold traders, primarily in Ghana. It provides a complete front-end suite covering authentication, a full-featured trading dashboard, and legal compliance pages — all with light/dark theme support and a responsive layout.

The platform is built for traders who need live gold price tracking, transaction management, customer records, gold value calculations, reporting, and receipt generation in a single interface.

---

## Pages

### `index.html` — Sign In / Sign Up
The entry point of the application. Features a split-panel layout with a branded left panel and a form-based right panel.

- **Sign In** — Email/password login with "Remember me" and social auth (Google, Microsoft)
- **Sign Up** — Full registration form with first/last name, work email, phone number, and password strength indicator
- **Forgot Password** — Email-based reset flow with an inline success confirmation
- **Social Auth** — Google and Microsoft OAuth buttons
- **Form Validation** — Inline field-level error messages
- **Theme Toggle** — Light/dark mode switcher

### `dashboard.html` — Main Application
The core trading interface, accessible after login. Uses a sidebar + navbar layout with page-based navigation (no full page reloads).

**Sidebar navigation includes:**

| Section | Pages |
|---|---|
| Main | Dashboard, Transactions, Customers |
| Tools | Calculator, Reports, Receipts |

**Dashboard** — Overview stats (total gold traded, revenue, active customers, pending transactions), a 7-day revenue chart (Chart.js), a live gold price widget (XAU/USD), and a recent transactions table.

**Transactions** — Searchable, filterable table of buy/sell transactions with status badges (Completed, Pending, Processing).

**Customers** — Customer directory with tier labels (VIP, Regular, New), contact details, and spending summaries.

**Calculator** — Gold value calculator supporting multiple karat grades (24K–9K), weight input in grams, buy/sell transaction types, a live karat reference table, and a price simulator for custom spot price and USD/GHS rate scenarios.

**Reports** — Report cards for Sales, Customer, Inventory, Profit & Loss, Transaction Log, and Price History reports, plus an annual performance chart.

**Receipts** — Searchable receipt log with print functionality.

**Navbar features:** global search across transactions/customers/pages, notification dropdown with unread indicators, user avatar dropdown (profile, settings, logout), and a theme toggle.

### `legal.html` — Terms of Service & Privacy Policy
A dual-document legal page with a sticky sidebar for navigation and a reading progress bar.

**Terms of Service covers:** Acceptance, Services description, Account responsibilities, Acceptable use, Data ownership, Payments, Intellectual property, Disclaimers, Liability limitations, Termination, and Governing law (Ghana).

**Privacy Policy covers:** Data collected, how it is used, sharing practices, cookies, data retention, security measures (256-bit encryption), user rights under Ghana's Data Protection Act 2012, children's privacy, international data transfers, and policy change notifications.

---

## Project Structure

```
goldtrack/
├── index.html                          # Authentication page (Sign In / Sign Up)
├── dashboard.html                      # Main application dashboard
├── legal.html                          # Terms of Service & Privacy Policy
└── assets/
    ├── fontawesome/
    │   ├── all.min.css
    │   └── all.min.js
    ├── custom/
    │   ├── home/
    │   │   ├── css/styles.css          # Styles for index.html
    │   │   └── js/main.js              # JS for auth forms and theme
    │   ├── dashboard/
    │   │   ├── css/styles.css          # Styles for dashboard.html
    │   │   └── js/main.js              # JS for dashboard pages and charts
    │   └── legal/
    │       └── css/styles.css          # Styles for legal.html
```

---

## External Dependencies

| Library | Version | Purpose |
|---|---|---|
| [Font Awesome](https://fontawesome.com/) | 6.5.0 | Icons throughout the UI |
| [Chart.js](https://www.chartjs.org/) | 4.4.1 | Revenue and performance charts |

Both are loaded from the Cloudflare CDN with local fallbacks via `/assets/fontawesome/`.

---

## Features

- **Live Gold Price Widget** — Displays real-time XAU/USD spot price with percentage change in the dashboard sidebar
- **Multi-karat Calculator** — Supports 24K, 22K, 18K, 14K, 10K, and 9K gold with purity-based value breakdowns in both USD and GHS
- **Light / Dark Theme** — Persisted theme toggle available on every page
- **GRA Compliant** — Built with Ghana Revenue Authority compliance in mind
- **256-bit Encryption** — Stated security standard for user data
- **Data Protection** — Registered with the Data Protection Commission of Ghana (Reg. No. DPC-2025-GT-00142)
- **Responsive Layout** — Mobile-friendly via viewport meta and flexible CSS

---

## Compliance & Legal

GoldTrack is governed by Ghanaian law and complies with:

- **Ghana's Data Protection Act, 2012**
- **Ghana Revenue Authority (GRA)** requirements
- **Data Protection Commission of Ghana** — Registration No. DPC-2025-GT-00142

Data is primarily stored in AWS Cape Town and Lagos regions. International transfers use Standard Contractual Clauses (SCCs).

---

## Contact

**GoldTrack Technologies Ltd**
Sowutwom, Pentecost University, Accra, Ghana
Phone: +233 55 397 7242
Business Hours: Mon–Fri, 08:00–17:00 GMT

For data/privacy requests, contact the Data Protection Officer via the details on the [Legal page](legal.html).
