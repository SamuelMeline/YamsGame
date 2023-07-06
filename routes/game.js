const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Patisserie = require("../models/patisserie");
const session = require("express-session");

// Configuration de la session
router.use(
	session({
		secret: "secret",
		resave: false,
		saveUninitialized: true,
	})
);

// Middleware d'authentification
function isAuthenticated(req, res, next) {
	if (req.session && req.session.userId) {
		return next();
	}
	return res.redirect("/login");
}

// Page d'accueil
router.get("/", (req, res) => {
	res.render("home.twig");
});

// Page d'inscription
router.get("/register", (req, res) => {
	res.render("register.twig");
});

// Gestion de l'inscription
router.post("/register", (req, res) => {
	const { username, password } = req.body;

	// Vérifier si l'utilisateur existe déjà dans la base de données
	User.findOne({ username })
		.then((existingUser) => {
			if (existingUser) {
				// Utilisateur déjà enregistré, rediriger vers la page de connexion
				return res.redirect("/login");
			}
			// Créer un nouvel utilisateur
			const newUser = new User({ username, password });
			newUser
				.save()
				.then(() => {
					// Utilisateur enregistré avec succès, rediriger vers la page de connexion
					res.redirect("/login");
				})
				.catch((error) => {
					console.error("Error registering user:", error);
					res.redirect("/register");
				});
		})
		.catch((error) => {
			console.error("Error checking existing user:", error);
			res.redirect("/register");
		});
});

// Page de connexion
router.get("/login", (req, res) => {
	res.render("login.twig");
});

// Gestion de la connexion
router.post("/login", (req, res) => {
	const { username, password } = req.body;

	// Vérifier les identifiants de connexion dans la base de données
	User.findOne({ username, password })
		.then((user) => {
			if (user) {
				// Identifiants valides, stocker l'ID de l'utilisateur dans la session
				req.session.userId = user._id;
				// Rediriger vers la page game
				res.redirect("/game");
			} else {
				// Identifiants invalides, rediriger vers la page de connexion
				res.redirect("/login");
			}
		})
		.catch((error) => {
			console.error("Error checking user credentials:", error);
			res.redirect("/login");
		});
});

router.get("/game", isAuthenticated, (req, res) => {
	// Récupération des pâtisseries restantes avec leur nombre
	Patisserie.find({ number: { $gt: 0 } })
		.then((patisseries) => {
			if (patisseries.length === 0) {
				// Toutes les pâtisseries ont été épuisées, rediriger vers une page indiquant la fin du jeu
				res.render("gameover.twig");
			} else {
				res.render("game.twig", { patisseriesRemaining: patisseries });
			}
		})
		.catch((error) => {
			console.error("Error retrieving remaining patisseries:", error);
			res.render("game.twig");
		});
});

// Gestion du lancement des dés et des résultats
router.post("/game/play", (req, res) => {
	const { username } = req.body;

	// Vérifier si l'utilisateur a déjà joué dans les 24 dernières heures
	User.findById(req.session.userId)
		.then((user) => {
			if (
				user.lastPlayed &&
				new Date() - user.lastPlayed < 24 * 60 * 60 * 1000
			) {
				// L'utilisateur a déjà joué dans les 24 dernières heures, rediriger vers une page indiquant d'attendre
				return res.render("wait.twig");
			}

			// Mettre à jour la date et l'heure du dernier jeu de l'utilisateur
			user.lastPlayed = new Date();
			user.save();

			// Génération de 5 dés aléatoires
			const dice = Array.from(
				{ length: 5 },
				() => Math.floor(Math.random() * 6) + 1
			);

			// Vérification des combinaisons
			let result = "";
			if (isYams(dice)) {
				result = "Yams";
				// Ajout de 7 pâtisseries gagnées au hasard pour le Yams
				addRandomPatisseries(
					req.session.userId,
					7,
					(error, patisseries) => {
						if (error) {
							console.error(
								"Error adding random patisseries:",
								error
							);
						}
						res.redirect(
							`/results?result=${result}&patisseries=${JSON.stringify(
								patisseries
							)}`
						);
					}
				);
			} else if (isQuinte(dice)) {
				result = "Quinte";
				// Ajout de 6 pâtisseries gagnées au hasard pour la Quinte
				addRandomPatisseries(
					req.session.userId,
					6,
					(error, patisseries) => {
						if (error) {
							console.error(
								"Error adding random patisseries:",
								error
							);
						}
						res.redirect(
							`/results?result=${result}&patisseries=${JSON.stringify(
								patisseries
							)}`
						);
					}
				);
			} else if (isCarré(dice)) {
				result = "Carré";
				// Ajout de 5 pâtisseries gagnées au hasard pour le Carré
				addRandomPatisseries(
					req.session.userId,
					5,
					(error, patisseries) => {
						if (error) {
							console.error(
								"Error adding random patisseries:",
								error
							);
						}
						res.redirect(
							`/results?result=${result}&patisseries=${JSON.stringify(
								patisseries
							)}`
						);
					}
				);
			} else if (isFull(dice)) {
				result = "Full";
				// Ajout de 4 pâtisseries gagnées au hasard pour le Full
				addRandomPatisseries(
					req.session.userId,
					4,
					(error, patisseries) => {
						if (error) {
							console.error(
								"Error adding random patisseries:",
								error
							);
						}
						res.redirect(
							`/results?result=${result}&patisseries=${JSON.stringify(
								patisseries
							)}`
						);
					}
				);
			} else if (isBrelan(dice)) {
				result = "Brelan";
				// Ajout de 3 pâtisseries gagnées au hasard pour le Brelan
				addRandomPatisseries(
					req.session.userId,
					3,
					(error, patisseries) => {
						if (error) {
							console.error(
								"Error adding random patisseries:",
								error
							);
						}
						res.redirect(
							`/results?result=${result}&patisseries=${JSON.stringify(
								patisseries
							)}`
						);
					}
				);
			} else if (isDouble(dice)) {
				result = "Double Paire";
				// Ajout de 2 pâtisseries gagnées au hasard pour le Double
				addRandomPatisseries(
					req.session.userId,
					2,
					(error, patisseries) => {
						if (error) {
							console.error(
								"Error adding random patisseries:",
								error
							);
						}
						res.redirect(
							`/results?result=${result}&patisseries=${JSON.stringify(
								patisseries
							)}`
						);
					}
				);
			} else if (isSimple(dice)) {
				result = "Paire";
				// Ajout d'1 pâtisserie gagnée au hasard pour le Double Paire
				addRandomPatisseries(
					req.session.userId,
					1,
					(error, patisseries) => {
						if (error) {
							console.error(
								"Error adding random patisseries:",
								error
							);
						}
						res.redirect(
							`/results?result=${result}&patisseries=${JSON.stringify(
								patisseries
							)}`
						);
					}
				);
			} else {
				result = "Aucune combinaison gagnante";
				res.redirect(`/results?result=${result}`);
			}
		})
		.catch((error) => {
			console.error("Error checking user lastPlayed:", error);
			res.redirect("/game");
		});
});
// Fonction pour mettre à jour le nombre de pâtisseries restantes dans la base de données
function updatePatisseriesRemaining(patisseries) {
	const patisseriesIds = patisseries.map((patisserie) => patisserie._id);

	return Patisserie.updateMany(
		{ _id: { $in: patisseriesIds }, number: { $gt: 0 } },
		{ $inc: { number: -1 } },
		{ multi: true }
	).exec();
}

// Page des résultats
router.get("/results", isAuthenticated, (req, res) => {
	const { result, patisseries } = req.query;
	const parsedPatisseries = patisseries ? JSON.parse(patisseries) : [];

	res.render("results.twig", { result, patisseries: parsedPatisseries });
});

// Vérification du Yams
function isYams(dice) {
	const [d1, d2, d3, d4, d5] = dice;
	return d1 === d2 && d1 === d3 && d1 === d4 && d1 === d5;
}

// Vérification de la Quinte
function isQuinte(dice) {
	const sortedDice = dice.sort();
	return (
		(sortedDice[0] === 1 &&
			sortedDice[1] === 2 &&
			sortedDice[2] === 3 &&
			sortedDice[3] === 4 &&
			sortedDice[4] === 5) ||
		(sortedDice[0] === 2 &&
			sortedDice[1] === 3 &&
			sortedDice[2] === 4 &&
			sortedDice[3] === 5 &&
			sortedDice[4] === 6)
	);
}

// Vérification du Carré
function isCarré(dice) {
	const counts = getCounts(dice);
	return Object.values(counts).includes(4);
}

// Vérification du Full
function isFull(dice) {
	const counts = getCounts(dice);
	return (
		Object.values(counts).includes(3) && Object.values(counts).includes(2)
	);
}

// Vérification du Brelan
function isBrelan(dice) {
	const counts = getCounts(dice);
	return Object.values(counts).includes(3);
}

// Vérification de la Double Paire
function isDouble(dice) {
	const counts = getCounts(dice);
	const values = Object.values(counts);
	return (
		values.includes(2) && values.filter((count) => count >= 2).length === 2
	);
}

// Vérification de la Paire
function isSimple(dice) {
	const counts = getCounts(dice);
	return Object.values(counts).includes(2);
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
function addRandomPatisseries(userId, quantity, callback) {
	User.findById(userId)
		.populate("patisseries")
		.then((user) => {
			if (!user) {
				return callback(new Error("User not found"));
			}

			Patisserie.find({ number: { $gt: 0 } })
				.then((patisseries) => {
					if (patisseries.length === 0) {
						return callback(null, []); // Aucune pâtisserie restante
					}

					const availablePatisseries = patisseries.map(
						(patisserie) => ({
							id: patisserie._id,
							name: patisserie.name,
							number: patisserie.number,
						})
					);

					const selectedPatisseries = [];
					for (let i = 0; i < quantity; i++) {
						// Vérifier s'il ne reste qu'une seule catégorie de pâtisserie
						const uniqueCategory = availablePatisseries.every(
							(patisserie) =>
								patisserie.number ===
								availablePatisseries[0].number
						);

						let randomIndex;
						if (uniqueCategory) {
							// Si une seule catégorie, sélectionner une pâtisserie au hasard
							randomIndex = Math.floor(
								Math.random() * availablePatisseries.length
							);
						} else {
							// Sélectionner une pâtisserie en fonction de son nombre restant
							const totalRemaining = availablePatisseries.reduce(
								(sum, patisserie) => sum + patisserie.number,
								0
							);
							const randomValue =
								Math.floor(Math.random() * totalRemaining) + 1;

							let cumulativeSum = 0;
							randomIndex = availablePatisseries.findIndex(
								(patisserie) => {
									cumulativeSum += patisserie.number;
									return randomValue <= cumulativeSum;
								}
							);
						}

						const selectedPatisserie =
							availablePatisseries[randomIndex];
						selectedPatisseries.push(selectedPatisserie);

						// Décrémenter le nombre de pâtisseries restantes
						if (selectedPatisserie.number > 1) {
							selectedPatisserie.number--;
						} else {
							// Si le nombre est égal à 1, le laisser tel quel
							selectedPatisserie.number = 1;
						}
					}

					const patisserieIds = selectedPatisseries.map(
						(patisserie) => patisserie.id
					);

					Patisserie.updateMany(
						{ _id: { $in: patisserieIds }, number: { $gt: 0 } },
						{ $inc: { number: -1 * quantity } } // Mise à jour du nombre de pâtisseries restantes
					)
						.then(() => {
							user.patisseries.push(
								...selectedPatisseries.map(
									(patisserie) => patisserie.id
								)
							);
							user.save()
								.then(() => {
									callback(null, selectedPatisseries);
								})
								.catch((error) => {
									callback(error);
								});
						})
						.catch((error) => {
							callback(error);
						});
				})
				.catch((error) => {
					callback(error);
				});
		})
		.catch((error) => {
			callback(error);
		});
}

module.exports = router;
