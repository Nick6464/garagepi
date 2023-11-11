let Gpio;

try {
  // Check if the environment is Windows (for testing)
  // Use a mock implementation for GPIO on Windows
  Gpio = class {
    constructor(pin, direction) {
      this.pin = pin;
      this.direction = direction;
      this.value = 0;
    }
    readSync() {
      console.log(`[Mock GPIO] Read pin ${this.pin}`);
      return this.value;
    }
    writeSync(value) {
      this.value = value;
      console.log(`[Mock GPIO] Set pin ${this.pin} to ${value}`);
    }
    unexport() {
      console.log(`[Mock GPIO] Unexport pin ${this.pin}`);
    }
  };
} catch (error) {
  console.warn("Can't initialize GPIOs - are you on a Raspberry Pi?");
}

module.exports = Gpio;
