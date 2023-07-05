const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Patisserie = require('../models/patisserie');

// Page d'accueil
router.get('/', (req, res) => {
  res.render('home.twig');
});

// Page d'inscription
router.get('/register', (req, res) => {
  res.render('register.twig');
});

// Gestion de l'inscription
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Vérifier si l'utilisateur existe déjà dans la base de données
  User.findOne({ username })
    .then((existingUser) => {
      if (existingUser) {
        // Utilisateur déjà enregistré, rediriger vers la page de connexion
        res.redirect('/login');
      } else {
        // Créer un nouvel utilisateur
        const newUser = new User({ username, password });
        newUser.save()
          .then(() => {
            // Utilisateur enregistré avec succès, rediriger vers la page de connexion
            res.redirect('/login');
          })
          .catch((error) => {
            console.error('Error registering user:', error);
            res.redirect('/register');
          });
      }
    })
    .catch((error) => {
      console.error('Error checking existing user:', error);
      res.redirect('/register');
    });
});

// Page de connexion
router.get('/login', (req, res) => {
  res.render('login.twig');
});

// Gestion de la connexion
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Vérifier les identifiants de connexion dans la base de données
  User.findOne({ username, password })
    .then((user) => {
      if (user) {
        // Identifiants valides, rediriger vers la page game
        res.redirect('/game');
      } else {
        // Identifiants invalides, rediriger vers la page de connexion
        res.redirect('/login');
      }
    })
    .catch((error) => {
      console.error('Error checking user credentials:', error);
      res.redirect('/login');
    });
});

// Page du jeu
router.get('/game', (req, res) => {
  res.render('game.twig');
});

// Page de résultats
router.post('/results', (req, res) => {
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
