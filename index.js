const http = require('http');
const Gpio = require('onoff').Gpio;

const hostname = 'localhost';
const port = 3000;
const relayPin = 17;

// Initialize the relay pin as an output
const relay = new Gpio(relayPin, 'out');

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.statusCode = 200;

  if (req.url === '/on') {
    // Turn the relay on
    relay.writeSync(1);
    res.end('Relay is ON\n');
  } else if (req.url === '/off') {
    // Turn the relay off
    relay.writeSync(0);
    res.end('Relay is OFF\n');
  } else {
    res.end('Unknown command\n');
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

// Cleanup and unexport the relay GPIO pin on program exit
process.on('SIGINT', () => {
  relay.unexport();
  process.exit();
});
