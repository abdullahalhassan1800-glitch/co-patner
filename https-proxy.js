const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const selfsigned = require("selfsigned");
const httpProxy = require("http-proxy");

const TARGET = process.env.TARGET || "http://localhost:3001";
const PORT = process.env.PORT || 3443;
const HOST = "0.0.0.0";

// Generate self-signed cert
const attrs = [{ name: "commonName", value: "192.168.1.14" }];
const pems = selfsigned.generate(attrs, { days: 365 });

const certPath = path.join(__dirname, "cert.pem");
const keyPath = path.join(__dirname, "key.pem");

if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
  fs.writeFileSync(certPath, pems.cert);
  fs.writeFileSync(keyPath, pems.private);
}

const httpsOptions = {
  cert: fs.readFileSync(certPath),
  key: fs.readFileSync(keyPath),
};

// Create proxy with WebSocket support
const proxy = httpProxy.createProxyServer({
  target: TARGET,
  ws: true,
  secure: false,
});

proxy.on("error", (err, req, res) => {
  if (res && res.writeHead) {
    res.writeHead(502, { "Content-Type": "text/plain" });
    res.end("Proxy error");
  }
});

const server = https.createServer(httpsOptions, (req, res) => {
  proxy.web(req, res);
});

server.on("upgrade", (req, socket, head) => {
  proxy.ws(req, socket, head);
});

server.listen(PORT, HOST, () => {
  console.log(`🔒 HTTPS proxy running on https://192.168.1.14:${PORT}`);
  console.log(`   Proxying to ${TARGET}`);
});
