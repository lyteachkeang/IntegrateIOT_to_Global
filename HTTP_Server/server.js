const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());

// PostgreSQL connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mqtt_test',   // use the database you created in psql
  password: '210304',      // replace with your actual password
  port: 5432,
});

// Root route
app.get('/', (req, res) => {
  res.send('MQTT + PostgreSQL API is running');
});

// Endpoint: list distinct devices
app.get('/devices', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT device_id FROM sensor_data');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: all data for a device
app.get('/devices/:deviceName/data', async (req, res) => {
  try {
    const deviceName = req.params.deviceName;
    const result = await pool.query(
      'SELECT * FROM sensor_data WHERE device_id = $1 ORDER BY created_at DESC',
      [deviceName]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: latest data for a device
app.get('/devices/:deviceName/latest', async (req, res) => {
  try {
    const deviceName = req.params.deviceName;
    const result = await pool.query(
      'SELECT * FROM sensor_data WHERE device_id = $1 ORDER BY created_at DESC LIMIT 1',
      [deviceName]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
