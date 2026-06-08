/**
 * formulaire.js
 * Gère le formulaire de publication.
 * Envoie les données au serveur via POST /api/livres
 */


/* ═══════════════════════════════════════════
   APERÇU EN TEMPS RÉEL
═══════════════════════════════════════════ */

const Preview = (() => {
  const PLACEHOLDER = {
    title:  'Titre du livre',
    author: 'Prénom Nom',
    desc:   'La description du livre apparaîtra ici…',
    date:   'Date de publication'
  };

  function init() {
    const fields = {
      titre:  document.getElementById('titre'),
      prenom: document.getElementById('auteur_prenom'),
      nom:    document.getElementById('auteur_nom'),
      date:   document.getElementById('date_publication'),
      desc:   document.getElementById('description')
    };

    const preview = {
      title:  document.getElementById('preview-title'),
      author: document.getElementById('preview-author'),
      desc:   document.getElementById('preview-desc'),
      date:   document.getElementById('preview-date')
    };

    if (!preview.title) return;

    fields.titre?.addEventListener('input', () => {
      const v = fields.titre.value.trim();
      preview.title.textContent = v || PLACEHOLDER.title;
      preview.title.classList.toggle('preview-placeholder-text', !v);
    });

    const updateAuthor = () => {
      const p = fields.prenom?.value.trim() || '';
      const n = fields.nom?.value.trim()    || '';
      const full = [p, n].filter(Boolean).join(' ');
      preview.author.textContent = full || PLACEHOLDER.author;
      preview.author.classList.toggle('preview-placeholder-text', !full);
    };
    fields.prenom?.addEventListener('input', updateAuthor);
    fields.nom?.addEventListener('input', updateAuthor);

    fields.desc?.addEventListener('input', () => {
      const v = fields.desc.value.trim();
      preview.desc.textContent = v || PLACEHOLDER.desc;
      preview.desc.classList.toggle('preview-placeholder-text', !v);
    });

    fields.date?.addEventListener('input', () => {
      const v = fields.date.value;
      if (v) {
        preview.date.textContent = new Date(v).toLocaleDateString('fr-FR', {
          day: 'numeric', month: 'long', year: 'numeric'
        });
        preview.date.classList.remove('preview-placeholder-text');
      } else {
        preview.date.textContent = PLACEHOLDER.date;
        preview.date.classList.add('preview-placeholder-text');
      }
    });

    preview.title.classList.add('preview-placeholder-text');
    preview.author.classList.add('preview-placeholder-text');
    preview.desc.classList.add('preview-placeholder-text');
    preview.date.classList.add('preview-placeholder-text');
  }

  return { init };
})();


/* ═══════════════════════════════════════════
   UPLOAD COUVERTURE
═══════════════════════════════════════════ */

const CoverUpload = (() => {
  let base64Data = null;

  function init() {
    const zone        = document.getElementById('cover-upload-zone');
    const input       = document.getElementById('cover-input');
    const previewWrap = document.getElementById('cover-preview');
    const previewImg  = document.getElementById('cover-preview-img');
    const removeBtn   = document.getElementById('cover-remove');
    const previewCoverImg         = document.getElementById('preview-cover-img');
    const previewCoverPlaceholder = document.getElementById('preview-cover-placeholder');

    if (!zone || !input) return;

    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const file = e.dataTransfer?.files?.[0];
      if (file && file.type.startsWith('image/')) processFile(file);
    });

    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (file) processFile(file);
    });

    removeBtn?.addEventListener('click', () => {
      base64Data = null;
      previewWrap?.classList.remove('visible');
      zone.style.display = '';
      if (previewImg) previewImg.src = '';
      if (previewCoverImg) { previewCoverImg.src = ''; previewCoverImg.style.display = 'none'; }
      if (previewCoverPlaceholder) previewCoverPlaceholder.style.display = '';
      input.value = '';
    });

    function processFile(file) {
      const reader = new FileReader();
      reader.onload = e => {
        base64Data = e.target.result;
        if (previewImg) previewImg.src = base64Data;
        previewWrap?.classList.add('visible');
        zone.style.display = 'none';
        if (previewCoverImg) { previewCoverImg.src = base64Data; previewCoverImg.style.display = 'block'; }
        if (previewCoverPlaceholder) previewCoverPlaceholder.style.display = 'none';
      };
      reader.readAsDataURL(file);
    }
  }

  function getData() { return base64Data; }
  return { init, getData };
})();


/* ═══════════════════════════════════════════
   VALIDATION
═══════════════════════════════════════════ */

const Validation = (() => {
  const RULES = {
    titre:            { required: true, minLength: 1,  label: 'Le titre' },
    auteur_prenom:    { required: true, minLength: 2,  label: 'Le prénom' },
    auteur_nom:       { required: true, minLength: 2,  label: 'Le nom' },
    date_publication: { required: true,                label: 'La date' },
    description:      { required: true, minLength: 20, label: 'La description' }
  };

  function validateField(id) {
    const input   = document.getElementById(id);
    const errorEl = document.getElementById(`${id}-error`);
    if (!input) return true;

    const rule  = RULES[id];
    const value = input.value.trim();
    let error   = '';

    if (rule.required && !value)                       error = `${rule.label} est obligatoire.`;
    else if (rule.minLength && value.length < rule.minLength) error = `${rule.label} doit contenir au moins ${rule.minLength} caractères.`;

    input.classList.toggle('error', !!error);
    if (errorEl) { errorEl.textContent = error; errorEl.classList.toggle('visible', !!error); }
    return !error;
  }

  function validateAll() {
    return Object.keys(RULES).map(id => validateField(id)).every(Boolean);
  }

  function attachLiveValidation() {
    Object.keys(RULES).forEach(id => {
      const el = document.getElementById(id);
      el?.addEventListener('blur',  () => validateField(id));
      el?.addEventListener('input', () => { if (el.classList.contains('error')) validateField(id); });
    });
  }

  return { validateAll, attachLiveValidation };
})();


/* ═══════════════════════════════════════════
   TOAST
═══════════════════════════════════════════ */

function showToast(message, duration = 3500) {
  const toast    = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  if (!toast) return;
  toastMsg.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), duration);
}


/* ═══════════════════════════════════════════
   FORMULAIRE — ENVOI AU SERVEUR
═══════════════════════════════════════════ */

const PublishForm = (() => {
  function init() {
    const form     = document.getElementById('publish-form');
    const resetBtn = document.getElementById('form-reset');
    const submitBtn = document.querySelector('.btn-submit');

    if (!form) return;

    Validation.attachLiveValidation();

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!Validation.validateAll()) return;

      const livre = {
        titre:            document.getElementById('titre').value.trim(),
        auteur_prenom:    document.getElementById('auteur_prenom').value.trim(),
        auteur_nom:       document.getElementById('auteur_nom').value.trim(),
        date_publication: document.getElementById('date_publication').value,
        description:      document.getElementById('description').value.trim(),
        couverture:       CoverUpload.getData() || ''
      };

      // Désactive le bouton pendant l'envoi
      submitBtn.disabled = true;
      submitBtn.textContent = 'Publication…';

      try {
        const res = await fetch('/api/livres', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(livre)
        });

        if (!res.ok) throw new Error('Erreur serveur');

        showToast('✓ Livre publié avec succès !');
        form.reset();
        Preview.init();
        document.getElementById('cover-remove')?.click();

      } catch (err) {
        showToast('✗ Erreur lors de la publication.');
        console.error(err);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Publier le livre';
      }
    });

    resetBtn?.addEventListener('click', () => {
      form.reset();
      Preview.init();
      document.getElementById('cover-remove')?.click();
    });
  }

  return { init };
})();


/* ═══════════════════════════════════════════
   INITIALISATION
═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  CoverUpload.init();
  Preview.init();
  PublishForm.init();
});
