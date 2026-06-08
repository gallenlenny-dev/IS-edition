/**
 * server.js
 * Serveur Express pour IS Edition
 * Lance avec : node server.js
 * Site accessible sur : http://localhost:3000
 */

const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = 3000;
const JSON_PATH = path.join(__dirname, 'data', 'livres.json');

// ── Middlewares ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' })); // Parse le JSON (+ images base64)
app.use(express.static(__dirname));       // Sert tous les fichiers statiques


// ── GET /api/livres ──────────────────────────────────────────
// Retourne tous les livres du JSON
app.get('/api/livres', (req, res) => {
  try {
    const data = fs.readFileSync(JSON_PATH, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error('Erreur lecture livres.json :', err);
    res.status(500).json({ erreur: 'Impossible de lire les livres.' });
  }
});


// ── POST /api/livres ─────────────────────────────────────────
// Ajoute un livre et l'écrit dans livres.json
app.post('/api/livres', (req, res) => {
  try {
    const nouveau = req.body;

    // Validation minimale
    if (!nouveau.titre || !nouveau.auteur_nom) {
      return res.status(400).json({ erreur: 'Titre et auteur obligatoires.' });
    }

    // Lecture du JSON existant
    const data   = fs.readFileSync(JSON_PATH, 'utf-8');
    const livres = JSON.parse(data);

    // Ajout du nouveau livre en tête de liste
    nouveau.id = Date.now().toString();
    livres.unshift(nouveau);

    // Écriture dans le fichier
    fs.writeFileSync(JSON_PATH, JSON.stringify(livres, null, 2), 'utf-8');

    res.status(201).json({ succes: true, livre: nouveau });
  } catch (err) {
    console.error('Erreur écriture livres.json :', err);
    res.status(500).json({ erreur: 'Impossible de sauvegarder le livre.' });
  }
});


// ── Démarrage ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
   Serveur IS Edition démarré
   Ouvre ton navigateur sur : http://localhost:${PORT}
  `);
});
