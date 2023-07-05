const express = require('express');
const app = express();
const port = 8080; // Choisis un numéro de port approprié

// Configuration de Twig comme moteur de rendu
const Twig = require('twig');
app.set('twig', Twig.__express);

// Configuration du dossier public pour servir les fichiers statiques
app.use(express.static('public'));

// Configuration des routes
const gameRoutes = require('./routes/game');
app.use('/', gameRoutes);

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
