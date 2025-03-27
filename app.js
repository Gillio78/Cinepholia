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

// Configuration de la connexion à la base de données
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'SQL24!',
    database: 'cinepholia',
    port: 3306
});

// Connexion à la base de données
db.connect((err) => {
    if (err) {
        console.error('La connexion a échoué :', err);
        return;
    }
    console.log('Connecté à la base de données.');
});

// Route pour récupérer les films
app.get('/film', (req, res) => {
    const sql = 'SELECT titre, TO_BASE64(affiche) AS affiche FROM film';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erreur dans /film :', err);
            res.status(500).send('Erreur lors de la récupération des films.');
            return;
        }
        console.log("Films récupérés :", results);
        res.json(results); // Retourne les films au client
    });
});

// Route pour récupérer les cinémas
app.get('/getCinemas', (req, res) => {
    const query = 'SELECT Nom AS nom FROM cinema';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erreur dans /getCinemas :', err);
            res.status(500).send('Erreur lors de la récupération des cinémas.');
            return;
        }
        console.log("Cinémas récupérés :", results);
        res.json(results);
    });
});

// Démarre le serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
