/* ============================================
   Shared navigation behavior (all pages)
   ============================================ */
(function () {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  // Highlight the active nav link based on current page filename
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const current = path === '' ? 'index.html' : path;

  document.querySelectorAll('.main-nav a[data-nav]').forEach(link => {
    const href = link.getAttribute('href');
    if (href === current) {
      link.classList.add('active');
    }
  });
})();
