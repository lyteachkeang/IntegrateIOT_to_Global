const mqtt = require('mqtt');

// Connect to broker
const client = mqtt.connect('mqtt://172.20.10.3:1883');

const devices = ['d1', 'd2', 'd3'];

client.on('connect', () => {
  console.log('Publisher connected to broker');
  setInterval(() => {
    devices.forEach(deviceId => {
      const topic = `${deviceId}/sensor_data`;
      const temperature = (20 + Math.random() * 10).toFixed(2);
      const humidity = (40 + Math.random() * 20).toFixed(2);
      const payload = JSON.stringify({ temperature, humidity });

      client.publish(topic, payload);
      console.log(`Sent to ${topic} -> ${payload}`);
    });
  }, 2000);
});

client.on('error', (err) => {
  console.error('Publisher error:', err);
});
