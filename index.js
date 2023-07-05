const express = require('express');
const mongoose = require('mongoose');
const gameRouter = require('./routes/game');
const path = require('path');

const app = express();

// Middleware pour parser le corps des requêtes
app.use(express.urlencoded({ extended: true }));

// Connexion à la base de données MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/game-yams', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Configuration du moteur de rendu Twig
app.set('view engine', 'twig');
app.set('views', './views');

// Servir les fichiers CSS
app.use('/css', express.static(path.join(__dirname, 'css')));

// Routes du jeu
app.use('/', gameRouter);

// Démarrer le serveur
app.listen(3000, () => {
  console.log('Server started on port http://localhost:3000');
});
