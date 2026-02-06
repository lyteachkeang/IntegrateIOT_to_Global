const mqtt = require('mqtt');
const { Client } = require('pg');

// Connect to MQTT broker
const mqttClient = mqtt.connect('mqtt://172.20.10.3:1883');

// Connect to PostgreSQL
const db = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'mqtt_test',
  password: '210304', // replace with the one you set in psql
  port: 5432,
});
db.connect();

mqttClient.on('connect', () => {
  console.log('Subscriber connected to broker');
  // Subscribe to all topics for testing
  mqttClient.subscribe('#');
});

mqttClient.on('message', (topic, message) => {
  const payloadRaw = message.toString();
  let payloadJson = null;

  try {
    payloadJson = JSON.parse(payloadRaw);
  } catch (err) {
    console.error('Invalid JSON payload:', payloadRaw);
  }

  const deviceId = topic.split('/')[0]; // e.g. "d1" from "d1/sensor_data"

  db.query(
    'INSERT INTO sensor_data (device_id, topic, payload_raw, payload_json) VALUES ($1, $2, $3, $4)',
    [deviceId, topic, payloadRaw, payloadJson],
    (err, res) => {
      if (err) {
        console.error('DB insert error:', err);
      } else {
        console.log(`Saved data from ${deviceId}: ${payloadRaw}`);
      }
    }
  );
});
