const express = require('express');
const { Client } = require('pg'); // Module pour interagir avec PostgreSQL
const app = express();
const port = 3000;
const cors = require('cors');

// Configuration de la connexion à PostgreSQL/PostGIS
const client = new Client({
  user: 'postgres',       // Remplacez par votre utilisateur PostgreSQL
  host: 'localhost',               // Serveur PostgreSQL (généralement localhost)
  database: 'haouz',          // Nom de votre base de données
  password: '1234',  // Mot de passe PostgreSQL
  port: 5432,                      // Port PostgreSQL (par défaut 5432)
});

// Activer CORS pour toutes les routes
app.use(cors());

// Connexion à la base de données
client.connect()
  .then(() => console.log('Connecté à la base de données PostgreSQL'))
  .catch(err => console.error('Erreur de connexion à PostgreSQL', err));

app.get('/geojson/:table', (req, res) => {
  const tableName = req.params.table; // Récupère le nom de la table depuis l'URL

  // Vérifiez si le nom de la table est valide (pour éviter les injections SQL)
  const allowedTables = ['Adassi', 'Asni', 'Adebdi','Talat_nyaaqoub','Tahnouat','Assaki','Amizmiz','AitOthmane','DouarTalatnyaaqoub', 
    'DouarTahnaout','DouarAssaki','DouarAsni','DouarAmizmiz','DouarAdassi','Douaraitothmane', 'DouarAdebdi','Camp_talat_nyaaqoub','Camp_amizmiz','Camp_Asni',
'Camp_tahnaout', 'voietouches_Amizmiz','voietouches_tahnaout', 'voietouches_talat_nayaaqoub','epicentre','delimitationelhaouz' ]; // Liste des tables autorisées
  
if (!allowedTables.includes(tableName)) {
    res.status(400).send('Table non autorisée');
    return;
  }

  // Requête SQL pour récupérer les géométries en GeoJSON depuis la table spécifiée
  const query = `
    SELECT ST_AsGeoJSON(geom) AS geojson
    FROM ${tableName} -- Nom de la table dynamique
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
        geometry: JSON.parse(row.geojson),
        properties: {},
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

