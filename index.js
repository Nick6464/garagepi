const dotenv = require("dotenv");
const express = require("express");
const jwtMiddleware = require("./jwtMiddleware");
require("dotenv").config();

const { hostname, port, relayPin, NODE_ENV } = process.env;

let Gpio;
if (NODE_ENV === "development") {
  Gpio = require("./gpio");
} else {
  Gpio = require("onoff").Gpio;
}

const relay = new Gpio(relayPin, "out");

const app = express();

app.use(express.json());

// Apply JWT verification middleware to the routes that need protection
// app.get("/on", jwtMiddleware.jwtVerificationMiddleware, (req, res) => {
//   relay.writeSync(1);
//   res.send("Relay is ON");
// });

// app.get("/off", jwtMiddleware.jwtVerificationMiddleware, (req, res) => {
//   relay.writeSync(0);
//   res.send("Relay is OFF");
// });

// app.get("/toggle", jwtMiddleware.jwtVerificationMiddleware, (req, res) => {
//   const currentValue = relay.readSync();
//   relay.writeSync(currentValue ^ 1);
//   res.send(`Relay is ${currentValue ? "OFF" : "ON"}`);
// });

// Button Press for 0.2 seconds
app.get("/press", jwtMiddleware.jwtVerificationMiddleware, (req, res) => {
  relay.writeSync(1);
  setTimeout(() => {
    relay.writeSync(0);
  }, 250);
  res.send("Relay is ON");
});

app.listen(port, hostname, () => {
  console.log(`Server running at https://${hostname}:${port}/`);
});

// Cleanup and unexport the relay GPIO pin on program exit
process.on("SIGINT", () => {
  relay.unexport();
  process.exit();
});
