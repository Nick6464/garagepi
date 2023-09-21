const Gpio = require('onoff').Gpio;
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken'); // Add the JWT library
const express = require('express');

// Load environment variables from .env file
dotenv.config();

// Get the env variables we need
const { hostname, port, relayPin, jwtSecret } = process.env; // Provide the JWT secret

// Initialize the relay pin as an output
const relay = new Gpio(relayPin, 'out');

const app = express();

app.use(express.json()); // Enable JSON request parsing

// Relay control routes
app.get('/on', ensureAuthenticated, (req, res) => {
  // Turn the relay on
  relay.writeSync(1);
  res.send('Relay is ON');
});

app.get('/off', ensureAuthenticated, (req, res) => {
  // Turn the relay off
  relay.writeSync(0);
  res.send('Relay is OFF');
});

// Ensure user is authenticated by verifying the JWT token
function ensureAuthenticated(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).send('Unauthorized. Token missing.');
  }

  try {
    // Verify the JWT token using the secret
    const decoded = jwt.verify(token, jwtSecret);

    // Access the user's claims in the 'decoded' object
    if (decoded && decoded.permissions.includes('control_relay')) {
      return next();
    } else {
      return res.status(403).send('Forbidden. Insufficient permissions.');
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).send('Unauthorized. Invalid token.');
  }
}

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

// Cleanup and unexport the relay GPIO pin on program exit
process.on('SIGINT', () => {
  relay.unexport();
  process.exit();
});
