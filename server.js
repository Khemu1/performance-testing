process.env.UV_THREADPOOL_SIZE = 1; // limiting the number of threads for I/O operations like crypto

const http = require("http");
const os = require("os");
const express = require("express");
const cluster = require("cluster");
const crypto = require("crypto");

function getIpAddress() {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    for (const iface of networkInterfaces[interfaceName]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "127.0.0.1"; // fallback to localhost if no IPv4 address found
}

const ip = getIpAddress();
const port = 3000;

// if (cluster.isMaster) {
//   console.log("Master cluster is up");
//   // will be using pm2 instead 
//   // const numCpus = os.cpus().length; 
//   // for (let i = 0; i < 4; i++) {
//   //   cluster.fork();
//   // }

//   // Optional: Handle worker exits and log when a worker exits
//   cluster.on("exit", (worker, code, signal) => {
//     console.log(
//       `Worker ${worker.id} died with code: ${code}, signal: ${signal}`
//     );
//   });
// } else {

// }

  console.log(`Worker thread ${cluster.worker.id} is up`);

  const app = express();

  const server = http.createServer(app);

  /**
   * Perform a CPU-intensive task for a certain duration.
   *
   * @param {number} duration - The duration in milliseconds for which the work should be done.
   */
  app.get("/", (req, res) => {
    const start = Date.now();
    /**
     * This line will get executed in the event loop, which means it won't be able
     * to do other tasks while the operation is running. Consider offloading this work
     * to a worker or using async/await to handle concurrency.
     */
    crypto.pbkdf2("a", "b", 100000, 512, "sha512", (err, derivedKey) => {
      if (err) {
        console.error("Error performing pbkdf2 operation:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      console.log(`1: ${Date.now() - start}ms`);
      res.send("Operation completed");
    });
  });

  app.get("/fast", (req, res) => {
    res.send("Fast response");
  });

  server.listen(port, ip, () => {
    console.log(`Server is listening on http://${ip}:${port}`);
  });