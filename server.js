process.env.UV_THREADPOOL_SIZE = 1; // limiting the number of threads for I/O operations like crypto

const http = require("http");
const os = require("os");
const express = require("express");
const { Worker } = require("node:worker_threads");
const path = require("path");

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

const app = express();

const server = http.createServer(app);


app.get("/", (req, res) => {
  const worker = new Worker(path.resolve(__dirname, "worker.js"));

  worker.on("message", (counter) => {
    console.log("counter", counter);
    res.send(`Counted to ${counter}`);
  });

  worker.on("error", (err) => {
    console.error("Worker error:", err);
    res.status(500).send("Worker error");
  });

  worker.on("exit", (code) => {
    if (code !== 0) {
      console.error(`Worker stopped with exit code ${code}`);
    }
  });
});

app.get("/fast", (req, res) => {
  res.send("Fast response");
});

server.listen(port, ip, () => {
  console.log(`Server is listening on http://${ip}:${port}`);
});
