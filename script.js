/* ================================================
   BUNKVERSE — Shared Script
   Navigation, Utilities, Toast Notifications
   ================================================ */

// ─── Navbar Active State ──────────────────────────
(function () {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html') || (path === 'index.html' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

// ─── Navbar Scroll Effect ─────────────────────────
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.navbar');
  if (nav) {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }
});

// ─── Hamburger Menu ───────────────────────────────
function toggleMobileMenu() {
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.nav-mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  }
}

// ─── Toast Notifications ──────────────────────────
function showToast(message, type = 'info', duration = 3000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `${icons[type] || '💬'} ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ─── LocalStorage Helper ──────────────────────────
const Storage = {
  get(key, fallback = null) {
    try {
      const v = localStorage.getItem('bunkverse_' + key);
      return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('bunkverse_' + key, JSON.stringify(value)); } catch {}
  }
};

// ─── Animated Counter ─────────────────────────────
function animateCounter(element, from, to, duration = 1000, suffix = '') {
  const start = performance.now();
  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(from + (to - from) * eased) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ─── Fake AI Loading Animation ────────────────────
function fakeAILoad(messages, containerEl, finalCallback, stepDelay = 700) {
  let i = 0;
  containerEl.innerHTML = `<div class="loading-dots"><span></span><span></span><span></span></div>`;

  const interval = setInterval(() => {
    if (i < messages.length) {
      containerEl.innerHTML = `<span style="color:var(--purple-light);font-size:0.9rem;font-weight:600;">${messages[i]}</span>`;
      i++;
    } else {
      clearInterval(interval);
      finalCallback();
    }
  }, stepDelay);
}

// ─── Generate Particles ───────────────────────────
function generateParticles(containerId, emojis, count = 10) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const particles = ['💀', '🥷', '📚', '🎓', '😴', '🤥', '🏃', '📱'];
  const used = emojis || particles;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = used[Math.floor(Math.random() * used.length)];
    p.style.left = `${Math.random() * 100}%`;
    p.style.top = `${Math.random() * 100}%`;
    p.style.animationDelay = `${Math.random() * 4}s`;
    p.style.animationDuration = `${3 + Math.random() * 3}s`;
    container.appendChild(p);
  }
}

// ─── Navbar HTML Builder ──────────────────────────
function buildNavbar() {
  const pages = [
    { href: 'index.html', label: 'Home' },
    { href: 'bunk.html', label: 'Bunk Aakano?' },
    { href: 'excuse.html', label: 'Excuse Suggestion' },
    { href: 'rank.html', label: 'Bunking Rank' },
    { href: 'teacher.html', label: 'Teacher AI' },
    { href: 'gallery.html', label: 'Meme Gallery' },
  ];

  const path = window.location.pathname.split('/').pop() || 'index.html';

  const linksHTML = pages.map(p =>
    `<a href="${p.href}" class="${path === p.href ? 'active' : ''}">${p.label}</a>`
  ).join('');

  return `
  <nav class="navbar" id="mainNav">
    <a href="index.html" class="nav-logo">
      <span class="logo-icon">🥷</span> BUNKVERSE
    </a>
    <div class="nav-links">${linksHTML}</div>
    <div class="nav-hamburger" onclick="toggleMobileMenu()" id="hamburger">
      <span></span><span></span><span></span>
    </div>
  </nav>
  <div class="nav-mobile-menu" id="mobileMenu">
    ${pages.map(p => `<a href="${p.href}" class="${path === p.href ? 'active' : ''}">${p.label}</a>`).join('')}
  </div>`;
}

// ─── Footer HTML Builder ──────────────────────────
function buildFooter() {
  return `
  <footer class="footer">
    <div class="container">
      <p><strong>🥷 BUNKVERSE</strong> — Made with 💀 by a professional bunker</p>
      <p style="margin-top:6px;font-size:0.78rem;">"ഹാജർ നൽകാൻ ഞാൻ ഇവിടെ ഇല്ല. ഞാൻ ഒരു legend ആണ്." 🏆</p>
    </div>
  </footer>`;
}

// Auto-inject navbar & footer if placeholders exist
document.addEventListener('DOMContentLoaded', () => {
  const navPlaceholder = document.getElementById('nav-placeholder');
  if (navPlaceholder) navPlaceholder.outerHTML = buildNavbar();

  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) footerPlaceholder.outerHTML = buildFooter();
});
