// ============================================================
// PROFILE
// ============================================================

function previewAvatar(input) {
  if (!input.files || !input.files[0]) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('profileAvatarImg').src = e.target.result;
    // Also update navbar avatar
    document.querySelectorAll('.nav-avatar img, .user-info-av img').forEach(img => {
      img.src = e.target.result;
    });
    showToast('Profile photo updated');
  };
  reader.readAsDataURL(input.files[0]);
}

function toggleProfilePw(id, btn) {
  const inp = document.getElementById(id);
  const show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  btn.innerHTML = show ? '<i class="fa fa-eye-slash"></i>' : '<i class="fa fa-eye"></i>';
}

function saveProfile() {
  const btn = document.getElementById('saveProfileBtn');
  btn.classList.add('loading');
  btn.disabled = true;
  const first = document.getElementById('pfFirstName').value.trim();
  const last  = document.getElementById('pfLastName').value.trim();
  setTimeout(() => {
    btn.classList.remove('loading');
    btn.disabled = false;
    if (first || last) {
      const fullName = `${first} ${last}`.trim();
      document.getElementById('profileDisplayName').textContent = fullName;
      document.querySelector('.user-info-name') && (document.querySelector('.user-info-name').textContent = fullName);
    }
    showToast('Profile saved successfully');
  }, 1200);
}

function changePassword() {
  const current  = document.getElementById('pfCurrentPw').value;
  const newPw    = document.getElementById('pfNewPw').value;
  const confirm  = document.getElementById('pfConfirmPw').value;
  const alertEl  = document.getElementById('pfPwAlert');

  alertEl.className = 'profile-pw-alert';
  alertEl.style.display = 'none';

  if (!current) {
    alertEl.className = 'profile-pw-alert error';
    alertEl.innerHTML = '<i class="fa fa-circle-exclamation"></i> Please enter your current password.';
    alertEl.style.display = 'flex';
    return;
  }
  if (newPw.length < 8) {
    alertEl.className = 'profile-pw-alert error';
    alertEl.innerHTML = '<i class="fa fa-circle-exclamation"></i> New password must be at least 8 characters.';
    alertEl.style.display = 'flex';
    return;
  }
  if (newPw !== confirm) {
    alertEl.className = 'profile-pw-alert error';
    alertEl.innerHTML = '<i class="fa fa-circle-exclamation"></i> Passwords do not match.';
    alertEl.style.display = 'flex';
    return;
  }
  // Simulate success
  alertEl.className = 'profile-pw-alert success';
  alertEl.innerHTML = '<i class="fa fa-check-circle"></i> Password updated successfully.';
  alertEl.style.display = 'flex';
  document.getElementById('pfCurrentPw').value = '';
  document.getElementById('pfNewPw').value = '';
  document.getElementById('pfConfirmPw').value = '';
}

// ============================================================
// SETTINGS
// ============================================================

function switchSettingsTab(tab) {
  document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
  document.querySelector(`.settings-tab[data-stab="${tab}"]`).classList.add('active');
  document.getElementById(`stab-${tab}`).classList.add('active');
}

function saveSettings() {
  const btns = document.querySelectorAll('#page-settings .btn-gold');
  btns.forEach(b => { b.classList.add('loading'); b.disabled = true; });
  setTimeout(() => {
    btns.forEach(b => { b.classList.remove('loading'); b.disabled = false; });
    showToast('Settings saved');
  }, 1100);
}

function setThemeOption(theme) {
  document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
  document.getElementById(`themeOpt${theme.charAt(0).toUpperCase() + theme.slice(1)}`).classList.add('active');
  const html = document.documentElement;
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    html.setAttribute('data-theme', theme);
  }
  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.innerHTML = html.getAttribute('data-theme') === 'dark'
      ? '<i class="fa fa-sun"></i>'
      : '<i class="fa fa-moon"></i>';
  }
  setTimeout(initCharts, 50);
}

function setAccent(el) {
  document.querySelectorAll('.accent-swatch').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
  // Note: full dynamic accent would require CSS var override — this is the hook
  showToast('Accent colour updated (save to apply)');
}

function confirmDangerAction(action) {
  const labels = {
    'clear-transactions': 'clear ALL transaction data? This cannot be undone.',
    'delete-account': 'permanently DELETE your account? This cannot be undone.'
  };
  if (confirm(`Are you sure you want to ${labels[action] || 'proceed?'}`)) {
    showToast(action === 'delete-account' ? 'Account deletion requested' : 'Transaction data cleared');
  }
}

// ============================================================
// WIRE UP PROFILE & SETTINGS in showPage
// (Patch into existing showPage — add these pages to the sidebar)
// ============================================================

// Add profile & settings nav items to sidebar click handler
// (since they use data-page attributes this is automatic IF
//  the nav-items exist — wire user-dropdown menu items too)
document.querySelectorAll('.user-menu-item').forEach(item => {
  const text = item.textContent.trim().toLowerCase();
  if (text.includes('profile'))  item.addEventListener('click', () => { showPage('profile');  closeDropdowns(); });
  if (text.includes('settings')) item.addEventListener('click', () => { showPage('settings'); closeDropdowns(); });
});
