const { parentPort } = require("worker_threads");

let counter = 0;
while (counter < 1e9) {
  counter++;
}

parentPort.postMessage(counter);
