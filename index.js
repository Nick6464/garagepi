const dotenv = require("dotenv");
const WebSocket = require("ws");
require("dotenv").config();

const { relayPin, NODE_ENV, childPiId } = process.env;

let Gpio;
if (NODE_ENV === "development") {
  Gpio = require("./gpio");
} else {
  Gpio = require("onoff").Gpio;
}

const relay = new Gpio(relayPin, "out");

function connect() {
  const ws = new WebSocket(NODE_ENV == 'development' ? "ws://localhost:8080" : "ws://219.89.196.192:19049");

  ws.on("open", () => {
    console.log("Connected to server");
    ws.send(childPiId);
  });

  ws.on("message", (message) => {
    if (message === "press") {
      relay.writeSync(1);
      setTimeout(() => {
        relay.writeSync(0);
      }, 250);
      console.log("Relay is ON");
    }
  });

  ws.on("close", () => {
    console.log("Connection closed, trying to reconnect");
    setTimeout(connect, 5000); // try to reconnect after 5 seconds
  });

  ws.on("error", (err) => {
    console.error("WebSocket error observed:", err);
  });
}

connect();

// Cleanup and unexport the relay GPIO pin on program exit
process.on("SIGINT", () => {
  relay.unexport();
  process.exit();
});
