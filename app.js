const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const app = express();
const port = 3001;

// Servir les fichiers statiques depuis le dossier "public"
app.use(express.static(path.join(__dirname, '.')));

// Définir une route par défaut pour envoyer "accueil.html"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '.', 'accueil.html'));
});

// Middleware pour servir les fichiers statiques
app.use(express.static('public'));

// Configuration de la connexion à la base de données
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'SQL24!', // mot de passe
    database: 'cinepholia',
    port: 3306
});

// Connexion à la base de données
db.connect((err) => {
    if (err) {
        console.error('La connexion a échoué : ' + err.stack);
        return;
    }
    console.log('Connecté à la base de données.');
});

// Fonction pour récupérer les films :
function loadFilms(callback) {
    const sql = 'SELECT titre FROM film';
    db.query(sql, (err, results) => {
        if (err) {
            return callback(err, null);
        }
        console.log("Films récupérés depuis la base de données :", results);
        //callback(null, results);
    });
}


// Route pour récupérer et envoyer les films en JSON
app.get('/film', (req, res) => {
    console.log("Requête reçue sur /film"); // Vérifie si la route est appelée
    loadFilms((err, films) => {
        if (err) {
            console.error("Erreur dans /film :", err);
            return res.status(500).send('Erreur lors de la récupération des films.');
        }
        console.log("Films récupérés et envoyés au client :", films); // Affiche les films avant envoi
        res.json(films);
    });
});



// Démarre le serveur
app.listen(port, () => {
    console.log(Serveur démarré sur http://localhost:${port});
});