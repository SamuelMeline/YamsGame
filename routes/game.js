const express = require('express');
const router = express.Router();
const Patisserie = require('../models/patisserie');

// Page principale du jeu
router.get('/', (req, res) => {
  // TODO: Gérer le lancer des dés, les combinaisons et l'affichage des pâtisseries gagnées
  res.render('game.twig');
});

// Page des pâtisseries gagnées
router.get('/results', (req, res) => {
  // TODO: Récupérer les pâtisseries gagnées depuis la base de données et les afficher
  res.render('results.twig');
});

module.exports = router;
