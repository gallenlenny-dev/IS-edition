/**
 * catalogue.js
 * Gère le carrousel hero, le chargement depuis l'API,
 * et le rendu des cartes livres.
 */


/* ═══════════════════════════════════════════
   CARROUSEL
═══════════════════════════════════════════ */

const Carousel = (() => {
  let currentIndex = 0;
  let autoPlayTimer = null;
  const AUTOPLAY_DELAY = 5000;

  function init() {
    const track     = document.querySelector('.carousel-track');
    const slides    = document.querySelectorAll('.carousel-slide');
    const dots      = document.querySelectorAll('.carousel-dot');
    const prevBtn   = document.querySelector('.carousel-arrow.prev');
    const nextBtn   = document.querySelector('.carousel-arrow.next');

    if (!track || slides.length === 0) return;

    goTo(0, slides, dots, track);

    prevBtn?.addEventListener('click', () => {
      const idx = (currentIndex - 1 + slides.length) % slides.length;
      goTo(idx, slides, dots, track);
      resetAutoPlay(slides, dots, track);
    });

    nextBtn?.addEventListener('click', () => {
      const idx = (currentIndex + 1) % slides.length;
      goTo(idx, slides, dots, track);
      resetAutoPlay(slides, dots, track);
    });

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        goTo(i, slides, dots, track);
        resetAutoPlay(slides, dots, track);
      });
    });

    let touchStartX = 0;
    track.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        const idx = diff > 0
          ? (currentIndex + 1) % slides.length
          : (currentIndex - 1 + slides.length) % slides.length;
        goTo(idx, slides, dots, track);
        resetAutoPlay(slides, dots, track);
      }
    }, { passive: true });

    startAutoPlay(slides, dots, track);
    track.addEventListener('mouseenter', () => stopAutoPlay());
    track.addEventListener('mouseleave', () => startAutoPlay(slides, dots, track));
  }

  function goTo(index, slides, dots, track) {
    slides[currentIndex]?.classList.remove('active');
    dots[currentIndex]?.classList.remove('active');
    currentIndex = index;
    track.style.transform = `translateX(-${index * 100}%)`;
    slides[index].classList.add('active');
    dots[index].classList.add('active');
  }

  function startAutoPlay(slides, dots, track) {
    stopAutoPlay();
    autoPlayTimer = setInterval(() => {
      const idx = (currentIndex + 1) % slides.length;
      goTo(idx, slides, dots, track);
    }, AUTOPLAY_DELAY);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) { clearInterval(autoPlayTimer); autoPlayTimer = null; }
  }

  function resetAutoPlay(slides, dots, track) {
    stopAutoPlay();
    startAutoPlay(slides, dots, track);
  }

  return { init };
})();


/* ═══════════════════════════════════════════
   CATALOGUE — CHARGEMENT DEPUIS L'API
═══════════════════════════════════════════ */

const Catalogue = (() => {

  async function loadLivres() {
    const res = await fetch('/api/livres');
    if (!res.ok) throw new Error('Erreur chargement livres');
    return await res.json();
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
    } catch (_) { return dateStr; }
  }

  function renderCard(livre) {
    const nom    = `${livre.auteur_prenom} ${livre.auteur_nom}`;
    const date   = formatDate(livre.date_publication);
    const hasCover = livre.couverture && livre.couverture.trim() !== '';

    const coverHtml = hasCover
      ? `<img src="${livre.couverture}" alt="Couverture de ${livre.titre}" loading="lazy">`
      : `<div class="cover-placeholder">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <span>${livre.titre}</span>
        </div>`;

    return `
      <article class="book-card" tabindex="0" aria-label="${livre.titre} par ${nom}">
        <div class="book-card-cover">
          ${coverHtml}
          <div class="book-card-overlay">
            <span class="overlay-btn">Voir le livre</span>
          </div>
        </div>
        <div class="book-card-body">
          <h3 class="book-card-title">${livre.titre}</h3>
          <p class="book-card-author">${nom}</p>
          <div class="book-card-meta">
            <span class="book-card-date">${date}</span>
            <span class="tag tag-orange">Roman</span>
          </div>
        </div>
      </article>`;
  }

  function renderCardH(livre) {
    const nom    = `${livre.auteur_prenom} ${livre.auteur_nom}`;
    const date   = formatDate(livre.date_publication);
    const hasCover = livre.couverture && livre.couverture.trim() !== '';

    const coverHtml = hasCover
      ? `<img src="${livre.couverture}" alt="Couverture de ${livre.titre}" loading="lazy">`
      : `<div style="width:100%;height:100%;background:var(--color-bg-surface);display:flex;align-items:center;justify-content:center;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(245,242,236,0.3)" stroke-width="1.5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>`;

    return `
      <article class="book-card-h" tabindex="0" aria-label="${livre.titre} par ${nom}">
        <div class="book-cover-h">${coverHtml}</div>
        <div class="book-info-h">
          <h3 class="book-title-h">${livre.titre}</h3>
          <p class="book-author-h">${nom}</p>
          <p class="book-desc-h">${livre.description || ''}</p>
          <span class="book-date-h">${date}</span>
        </div>
      </article>`;
  }

  function renderSkeletons(container, count = 6) {
    container.innerHTML = Array.from({ length: count }, () => `
      <div class="book-card-skeleton">
        <div class="skeleton-cover"></div>
        <div class="skeleton-body">
          <div class="skeleton-line medium"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>`
    ).join('');
  }

  async function init() {
    const catalogueGrid = document.getElementById('catalogue-grid');
    const recentsGrid   = document.getElementById('recents-grid');

    if (catalogueGrid) renderSkeletons(catalogueGrid);

    const livres = await loadLivres();

    if (recentsGrid) {
      const recents = [...livres]
        .sort((a, b) => new Date(b.date_publication) - new Date(a.date_publication))
        .slice(0, 3);

      recentsGrid.innerHTML = recents.length
        ? recents.map(renderCardH).join('')
        : '<p class="text-muted text-center" style="grid-column:1/-1">Aucun livre pour l\'instant.</p>';
    }

    if (catalogueGrid) {
      catalogueGrid.innerHTML = livres.length
        ? livres.map(renderCard).join('')
        : `<div class="catalogue-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <p>Aucun livre dans le catalogue.</p>
          </div>`;
    }
  }

  return { init };
})();


/* ═══════════════════════════════════════════
   INITIALISATION
═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  Carousel.init();
  Catalogue.init();
});
