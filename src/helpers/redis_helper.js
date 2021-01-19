const redis = require('redis');

const client = redis.createClient({
  host: '127.0.0.1',
  port: 6379,
});

client.on('connected', () => {
  console.log('Client connected to the Redis');
});

client.on('ready', () => {
  console.log('Redis is ready to use');
});

client.on('error', (err) => {
  console.log(err.message);
});

client.on('disconnected', () => {
  console.log('Client disconnected from the Redis');
});
process.on('SIGINT', () => {
  client.quit();
});

module.exports = client;
