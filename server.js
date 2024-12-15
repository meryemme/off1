const express = require('express');
const { Client } = require('pg'); // Module pour interagir avec PostgreSQL
const app = express();
const port = 3000;

// Configuration de la connexion à PostgreSQL/PostGIS
const client = new Client({
  user: 'postgres',       // Remplacez par votre utilisateur PostgreSQL
  host: 'localhost',               // Serveur PostgreSQL (généralement localhost)
  database: 'haouz',          // Nom de votre base de données
  password: '1234',  // Mot de passe PostgreSQL
  port: 5432,                      // Port PostgreSQL (par défaut 5432)
});

// Connexion à la base de données
client.connect()
  .then(() => console.log('Connecté à la base de données PostgreSQL'))
  .catch(err => console.error('Erreur de connexion à PostgreSQL', err));

// Route pour obtenir les données GeoJSON
app.get('/geojson', (req, res) => {
  // Requête pour récupérer des géométries en GeoJSON
  const query = `
    SELECT ST_AsGeoJSON(geom) AS geojson
    FROM Adassi  -- Remplacez par le nom de votre table
  `;

  client.query(query, (err, result) => {
    if (err) {
      console.error('Erreur lors de la requête', err);
      res.status(500).send('Erreur lors de l\'exécution de la requête');
      return;
    }

    // Construction de l'objet GeoJSON
    const geojson = {
      type: 'FeatureCollection',
      features: result.rows.map(row => ({
        type: 'Feature',
        geometry: JSON.parse(row.geojson),  // Convertir la chaîne GeoJSON en objet
        properties: {},                    // Ajoutez des propriétés si nécessaire
      })),
    };

    // Envoyer le GeoJSON en réponse
    res.json(geojson);
  });
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur en écoute sur http://localhost:${port}`);
});
