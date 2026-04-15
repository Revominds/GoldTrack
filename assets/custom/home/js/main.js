// ── TAB SWITCHING ──
function switchTab(tab) {
  document
    .querySelectorAll(".form-panel")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));
  if (tab === "login") {
    document.getElementById("panelLogin").classList.add("active");
    document.getElementById("tabLogin").classList.add("active");
    hideAlert("loginAlert");
  } else if (tab === "signup") {
    document.getElementById("panelSignup").classList.add("active");
    document.getElementById("tabSignup").classList.add("active");
    hideAlert("signupAlert");
  }
  // Re-animate
  const box = document.querySelector(".form-box");
  box.style.animation = "none";
  requestAnimationFrame(() => {
    box.style.animation = "fadeUp .3s ease both";
  });
}
function showForgot() {
  document
    .querySelectorAll(".form-panel")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));
  document.getElementById("panelForgot").classList.add("active");
}

// ── THEME ──
document.getElementById("themeBtn").addEventListener("click", function () {
  const html = document.documentElement;
  const dark = html.getAttribute("data-theme") === "dark";
  html.setAttribute("data-theme", dark ? "light" : "dark");
  this.innerHTML = dark
    ? '<i class="fa fa-moon"></i>'
    : '<i class="fa fa-sun"></i>';
});

// ── PASSWORD TOGGLE ──
function togglePw(id, btn) {
  const inp = document.getElementById(id);
  const show = inp.type === "password";
  inp.type = show ? "text" : "password";
  btn.innerHTML = show
    ? '<i class="fa fa-eye-slash"></i>'
    : '<i class="fa fa-eye"></i>';
}

// ── PASSWORD STRENGTH ──
function checkStrength(val) {
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const bars = [
    document.getElementById("bar1"),
    document.getElementById("bar2"),
    document.getElementById("bar3"),
    document.getElementById("bar4"),
  ];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const classes = ["", "weak", "fair", "good", "strong"];
  bars.forEach((b, i) => {
    b.className = "pw-bar";
    if (i < score) b.classList.add(classes[score]);
  });
  document.getElementById("pwLabel").textContent =
    val.length === 0
      ? "Use 8+ characters with numbers and symbols"
      : labels[score] || "Weak";
  document.getElementById("pwLabel").style.color =
    score <= 1
      ? "var(--danger)"
      : score === 2
        ? "var(--warn)"
        : score === 3
          ? "#63B31A"
          : "var(--success)";
}

// ── VALIDATION HELPERS ──
function setErr(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  if (msg) {
    el.style.display = "flex";
    el.querySelector("span").textContent = msg;
    const inp =
      el.previousElementSibling?.querySelector("input") ||
      el.parentElement.querySelector("input");
    if (inp) inp.classList.add("error");
  } else {
    el.style.display = "none";
    const inp =
      el.previousElementSibling?.querySelector("input") ||
      el.parentElement.querySelector("input");
    if (inp) inp.classList.remove("error");
  }
}
function showAlert(id, msg) {
  const el = document.getElementById(id);
  el.classList.add("show");
  const m = document.getElementById(id + "Msg");
  if (m) m.textContent = msg;
}
function hideAlert(id) {
  document.getElementById(id)?.classList.remove("show");
}
function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function setLoading(btnId, on) {
  const btn = document.getElementById(btnId);
  if (on) btn.classList.add("loading");
  else btn.classList.remove("loading");
  btn.disabled = on;
}

// ── LOGIN ──
function handleLogin() {
  hideAlert("loginAlert");
  const email = document.getElementById("loginEmail").value.trim();
  const pw = document.getElementById("loginPw").value;
  let valid = true;

  if (!email || !isEmail(email)) {
    setErr("loginEmailErr", "Please enter a valid email address");
    valid = false;
  } else setErr("loginEmailErr", "");
  if (!pw) {
    setErr("loginEmailErr", "");
    valid = false;
    showAlert("loginAlert", "Please enter your password.");
  }

  if (!valid) return;

  setLoading("loginBtn", true);
  setTimeout(() => {
    setLoading("loginBtn", false);
    // Demo: accept any valid email/pw
    if (pw.length >= 4) {
      // Redirect to dashboard
      goToDashboard();
    } else {
      showAlert("loginAlert", "Invalid email or password. Please try again.");
    }
  }, 1400);
}

// ── SIGNUP ──
function handleSignup() {
  hideAlert("signupAlert");
  const first = document.getElementById("signupFirst").value.trim();
  const last = document.getElementById("signupLast").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const pw = document.getElementById("signupPw").value;
  const pw2 = document.getElementById("signupPw2").value;
  const agreed = document.getElementById("agreeTerms").checked;
  let valid = true;

  setErr("signupFirstErr", first ? "" : "First name is required");
  if (!first) valid = false;
  setErr("signupLastErr", last ? "" : "Last name is required");
  if (!last) valid = false;
  if (!email || !isEmail(email)) {
    setErr("signupEmailErr", "Enter a valid email address");
    valid = false;
  } else setErr("signupEmailErr", "");
  if (pw.length < 8) {
    setErr("signupPwErr", "Password must be at least 8 characters");
    valid = false;
  } else setErr("signupPwErr", "");
  if (pw !== pw2) {
    setErr("signupPw2Err", "Passwords do not match");
    valid = false;
  } else setErr("signupPw2Err", "");
  if (!agreed) {
    showAlert("signupAlert", "Please accept the Terms of Service to continue.");
    valid = false;
  }

  if (!valid) return;
  setLoading("signupBtn", true);
  setTimeout(() => {
    setLoading("signupBtn", false);
    document.getElementById("successName").textContent = first;
    document
      .querySelectorAll(".form-panel")
      .forEach((p) => p.classList.remove("active"));
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("active"));
    document.getElementById("panelSuccess").classList.add("active");
  }, 1600);
}

// ── FORGOT ──
function handleForgot() {
  const email = document.getElementById("forgotEmail").value.trim();
  if (!email || !isEmail(email)) {
    alert("Please enter a valid email.");
    return;
  }
  setLoading("forgotBtn", true);
  setTimeout(() => {
    setLoading("forgotBtn", false);
    document.getElementById("forgotBtn").style.display = "none";
    document.getElementById("forgotEmailSent").textContent = email;
    document.getElementById("forgotSuccess").style.display = "block";
  }, 1300);
}

// ── SOCIAL AUTH ──
function socialAuth(provider) {
  const btn = event.currentTarget;
  btn.innerHTML = `<div style="width:16px;height:16px;border:2px solid var(--gold);border-top-color:transparent;border-radius:50%;animation:spin .7s linear infinite"></div> Connecting…`;
  btn.disabled = true;
  setTimeout(() => {
    btn.disabled = false;
    btn.innerHTML =
      provider === "Google"
        ? '<div class="g-icon"></div> Google'
        : '<i class="fa-brands fa-microsoft" style="color:#00a4ef"></i> Microsoft';
    showAlert(
      document.getElementById("panelLogin").classList.contains("active")
        ? "loginAlert"
        : "signupAlert",
      `${provider} sign-in is not yet configured.`,
    );
  }, 1200);
}

// ── NAVIGATE TO DASHBOARD ──
function goToDashboard() {
  window.location.href = "dashboard.html";
}

// ── CLEAR errors on input ──
document.querySelectorAll("input").forEach((inp) => {
  inp.addEventListener("input", function () {
    this.classList.remove("error");
    const errEl = this.closest(".field-wrap")?.nextElementSibling;
    if (errEl && errEl.classList.contains("field-error"))
      errEl.style.display = "none";
  });
});
