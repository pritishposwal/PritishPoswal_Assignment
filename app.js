const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

// MySQL database connection
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectTimeout: 30000 // Set timeout to 30 seconds
});

// All API endpoints are written here
// API for displaying Current Week Leaderboard of top 200 users
app.get('/leaderboard/current', (req, res) => {
    const query = "SELECT * FROM users WHERE WEEKOFYEAR(TimeStamp) = WEEKOFYEAR(NOW()) ORDER BY Score DESC LIMIT 200";
    pool.query(query, (error, results) => {
      if (error) {
        return res.status(500).json({ error });
      }
      res.json(results);
    });
  });
  
// API for displaying Last Week Leaderboard of top 200 users
app.get('/leaderboard/lastweek/:country', (req, res) => {
    const country = req.params.country;
    const query = "SELECT * FROM users WHERE Country = ? AND WEEKOFYEAR(TimeStamp) = WEEKOFYEAR(NOW()) - 1 ORDER BY Score DESC LIMIT 200";
    pool.query(query, [country], (error, results) => {
      if (error) {
        return res.status(500).json({ error });
      }
      res.json(results);
    });
  });
  
// API for displaying rank of a given user in the leaderboard
app.get('/user/rank/:uid', (req, res) => {
    const uid = req.params.uid;
    const rankQuery = "SELECT COUNT(*)+1 AS rankofuser FROM users WHERE Score > (SELECT Score FROM users WHERE UID = ?)";
    pool.query(rankQuery, [uid], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        res.json(results.length ? results[0] : { rank: "Not found" });
    });
});
// we are using PORT 3000 for our server and we are logging a message to the console that the server is running on port 3000.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
