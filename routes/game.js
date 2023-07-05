const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Patisserie = require('../models/patisserie');
const session = require('express-session');

// Configuration de la session
router.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
}));

// Middleware d'authentification
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.redirect('/login');
}

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
        return res.redirect('/login');
      }
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
        // Identifiants valides, stocker l'ID de l'utilisateur dans la session
        req.session.userId = user._id;
        // Rediriger vers la page game
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

// Page du jeu Yams
router.get('/game', isAuthenticated, (req, res) => {
  res.render('game.twig');
});

// Gestion du lancement des dés et des résultats
router.post('/game/play', (req, res) => {
  const { username } = req.body;

  // Génération de 5 dés aléatoires
  const dice = Array.from({ length: 5 }, () => Math.floor(Math.random() * 6) + 1);

  // Vérification des combinaisons
  let result = '';
  if (isYams(dice)) {
    result = 'Yams';
    // Ajout de 3 pâtisseries gagnées au hasard pour le Yams
    addRandomPatisseries(req.session.userId, 3, (error, patisseries) => {
      if (error) {
        console.error('Error adding random patisseries:', error);
      }
      res.redirect(`/results?result=${result}&patisseries=${JSON.stringify(patisseries)}`);
    });
  } else if (isCarré(dice)) {
    result = 'Carré';
    // Ajout de 2 pâtisseries gagnées au hasard pour le Carré
    addRandomPatisseries(req.session.userId, 2, (error, patisseries) => {
      if (error) {
        console.error('Error adding random patisseries:', error);
      }
      res.redirect(`/results?result=${result}&patisseries=${JSON.stringify(patisseries)}`);
    });
  } else if (isDoublePaire(dice)) {
    result = 'Double Paire';
    // Ajout d'1 pâtisserie gagnée au hasard pour le Double Paire
    addRandomPatisseries(req.session.userId, 1, (error, patisseries) => {
      if (error) {
        console.error('Error adding random patisseries:', error);
      }
      res.redirect(`/results?result=${result}&patisseries=${JSON.stringify(patisseries)}`);
    });
  } else {
    result = 'Aucune combinaison gagnante';
    res.redirect(`/results?result=${result}`);
  }
});

// Page des résultats
router.get('/results', isAuthenticated, (req, res) => {
  const { result, patisseries } = req.query;
  const parsedPatisseries = patisseries ? JSON.parse(patisseries) : [];

  res.render('results.twig', { result, patisseries: parsedPatisseries });
});


// Vérification du Yams
function isYams(dice) {
  const [d1, d2, d3, d4, d5] = dice;
  return d1 === d2 && d1 === d3 && d1 === d4 && d1 === d5;
}

// Vérification du Carré
function isCarré(dice) {
  const counts = getCounts(dice);
  return Object.values(counts).includes(4);
}

// Vérification de la Double Paire
function isDoublePaire(dice) {
  const counts = getCounts(dice);
  const values = Object.values(counts);
  return values.includes(2) && values.filter((count) => count >= 2).length === 2;
}

// Compter les occurrences de chaque dé
function getCounts(dice) {
  const counts = {};
  dice.forEach((d) => {
    if (!counts[d]) {
      counts[d] = 1;
    } else {
      counts[d]++;
    }
  });
  return counts;
}

// Ajouter des pâtisseries gagnées au hasard à l'utilisateur
function addRandomPatisseries(userId, count, callback) {
  Patisserie.findRandom(count)
    .then((patisseries) => {
      User.findByIdAndUpdate(
        userId,
        { $push: { patisseries: { $each: patisseries } } }
      )
        .then(() => {
          console.log(`Added ${count} random patisseries to user ${userId}`);
          callback(null, patisseries); // Retourner les pâtisseries gagnées via le callback
        })
        .catch((error) => {
          console.error('Error adding patisseries to user:', error);
          callback(error);
        });
    })
    .catch((error) => {
      console.error('Error finding random patisseries:', error);
      callback(error);
    });
}

module.exports = router;
