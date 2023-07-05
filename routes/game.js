const express = require('express');
const router = express.Router();
const Patisserie = require('../models/patisserie');

// Page principale du jeu
router.get('/', (req, res) => {
  res.render('game.twig');
});

// Page des pâtisseries gagnées
router.get('/results', (req, res) => {
  Patisserie.find()
    .then((patisseries) => {
      res.render('results.twig', { patisseries });
    })
    .catch((error) => {
      console.error('Error retrieving patisseries:', error);
      res.redirect('/');
    });
});

module.exports = router;
