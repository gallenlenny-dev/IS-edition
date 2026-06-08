/**
 * components.js
 * Injecte le header et le footer sur chaque page.
 * Fonctionne en file:// (HTML embarqué, pas de fetch).
 */

(function () {

  // Détecte si on est dans un sous-dossier en regardant
  // le nom du fichier HTML courant et son chemin complet
  const path = window.location.href;
  const inSubfolder = path.indexOf('/pages/') !== -1;
  const root = inSubfolder ? '../' : '';

  /* ═══════════════════════════════════════════
     HEADER — modifiez ici
  ═══════════════════════════════════════════ */
  const HEADER_HTML = `
<header class="site-header">
  <div class="container">
    <nav class="nav-inner" aria-label="Navigation principale">
      <a href="${root}index.html" class="nav-logo">
        <div class="nav-logo-placeholder">
          <img src="${root}icon/logo-is-edition-marseille-retina2x.png" alt="IS-Edition" style="height: 60px; width: auto;">
          
        </div>
      </a>

      <div class="nav-links">
        <a href="${root}index.html" class="nav-link">Accueil</a>
        <a href="${root}pages/catalogue.html" class="nav-link">Catalogue</a>
        <a href="${root}pages/publier.html" class="nav-cta">Publier</a>
      </div>

      <button class="nav-burger" aria-label="Menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </nav>

    <nav class="nav-mobile" aria-label="Navigation mobile">
      <a href="${root}index.html" class="nav-link">Accueil</a>
      <a href="${root}pages/catalogue.html" class="nav-link">Catalogue</a>
      <a href="${root}pages/publier.html" class="nav-cta">Publier un livre</a>
    </nav>
  </div>
</header>`;


  /* ═══════════════════════════════════════════
     FOOTER — modifiez ici
  ═══════════════════════════════════════════ */
  const FOOTER_HTML = `
<footer class="site-footer" aria-label="Pied de page">
  <div class="container">
    <div class="footer-inner">
      <div class="footer-brand">
        <span class="footer-logo-name">IS EDITION</span>
      </div>

      <div class="footer-section">
        <h4>Navigation</h4>
        <ul>
          <li><a href="${root}index.html">Accueil</a></li>
          <li><a href="${root}pages/catalogue.html">Catalogue</a></li>
          <li><a href="${root}pages/publier.html">Publier</a></li>
        </ul>
      </div>

      <div class="footer-section">
        <h4>Le projet</h4>
        <ul>
          <li><a href="#">À propos</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <p>Copyright © 2012-2026 - IS EDITION</p>
    </div>
  </div>
</footer>`;


  /* ═══════════════════════════════════════════
     INJECTION
  ═══════════════════════════════════════════ */
  function inject() {
    const headerEl = document.querySelector('header.site-header');
    if (headerEl) headerEl.outerHTML = HEADER_HTML;

    const footerEl = document.querySelector('footer.site-footer');
    if (footerEl) footerEl.outerHTML = FOOTER_HTML;

    // Lien actif
    const currentPage = window.location.href.split('/').pop().split('?')[0] || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href')?.split('/').pop();
      if (href === currentPage) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });

    // Burger menu
    const burger     = document.querySelector('.nav-burger');
    const mobileMenu = document.querySelector('.nav-mobile');
    if (burger && mobileMenu) {
      burger.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('open');
        burger.setAttribute('aria-expanded', isOpen);
        const bars = burger.querySelectorAll('span');
        if (isOpen) {
          bars[0].style.transform = 'translateY(7px) rotate(45deg)';
          bars[1].style.opacity   = '0';
          bars[2].style.transform = 'translateY(-7px) rotate(-45deg)';
        } else {
          bars.forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
        }
      });
      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          mobileMenu.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
          burger.querySelectorAll('span').forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
        });
      });
    }

    // Scroll sticky
    const header = document.querySelector('.site-header');
    if (header) {
      const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

})();
