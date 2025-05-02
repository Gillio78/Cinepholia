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
    const query = 'SELECT nom_cinema  FROM cinema';
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

//Route pour récupérer les films du menu

app.get('/getFilmsByCinema', (req, res) => {
    const cinema  = req.query.cinema;
    //const cinema = req.body.cinema;
    console.log('cinema=',req);
    console.log('Requête reçue sur /getFilmsByCinema'); // Log pour vérifier que la route est appelée
    const query = `
        SELECT DISTINCT film.titre 
        FROM film
        WHERE id_film IN(
        SELECT id_film
        FROM films_projetes
        WHERE id_cinema=(
        SELECT id_cinema
        FROM cinema
        WHERE nom_cinema=?))
 `;
    db.query(query,[cinema], (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des IDs des films :', err);
            res.status(500).send('Erreur serveur lors de la récupération des IDs des films.');
            return;
        }
        console.log('Films récupérés :', results); // Vérifie les résultats obtenus
        res.json(results); // Renvoie les résultats
    });
});

//Route pour récupérer les jours de la semaine
app.get('/joursSemaineAbreges', (req, res) => {
    console.log('La route a bien été appelée depuis XAMPP ou une autre requête.');
    const query = `
        SELECT LEFT(Jour, 3) AS jour_abrege
        FROM jours;
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erreur dans la récupération des jours :', err);
            res.status(500).send('Erreur serveur.');
            return;
        }
        console.log('Résultats renvoyés :', results);
        
        res.json(results);
    });
});

// Route pour récupérer les horaires
/*app.get('/getSeanceData', (req, res) => {
    const query = `
        SELECT id_jour, horaire
        FROM seances
        WHERE id_seance IN (
            SELECT id_seance
            FROM films_projetes
            WHERE id_cinema = ? AND id_film = ?
        );
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erreur dans /getSeanceData :', err);
            res.status(500).send('Erreur lors de la récupération des données.');
            return;
        }
        res.json(results); // Renvoie les résultats au front-end
    });
});*/

app.get('/getSeanceData', (req, res) => {
    const cinema = req.query.cinema;
    const film = req.query.film;

    // Vérifier que les paramètres existent
    if (!cinema || !film) {
        console.error('Erreur : Cinéma ou film manquant.');
        res.status(400).send('Les paramètres cinéma et film sont obligatoires.');
        return;
    }

    console.log(`Requête reçue : cinéma = ${cinema}, film = ${film}`);

    const query = `
        SELECT id_jour, horaire
        FROM seances
        WHERE id_seance IN (
            SELECT id_seance
            FROM films_projetes
            WHERE id_cinema = (SELECT id_cinema FROM cinema WHERE nom_cinema = ?)
            AND id_film = (SELECT id_film FROM film WHERE titre = ?)
        );
    `;

    db.query(query, [cinema, film], (err, results) => {
        if (err) {
            console.error('Erreur dans /getSeanceData :', err);
            res.status(500).send('Erreur serveur lors de la récupération des séances.');
            return;
        }
        console.log('Horaires récupérés :', results);
        res.json(results);
    });
});

// Démarre le serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});


