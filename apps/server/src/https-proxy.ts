import { createServer } from "https";
import { readFileSync } from "fs";
import { createProxyServer } from "http-proxy";
import { resolve } from "path";

const certPath = resolve(process.cwd(), "../../cert.pem");
const keyPath = resolve(process.cwd(), "../../key.pem");

const httpsOptions = {
  cert: readFileSync(certPath, "utf8"),
  key: readFileSync(keyPath, "utf8"),
};

const WEB_PORT = 3001;
const API_PORT = 4000;

function targetFor(req): string {
  return req.url.startsWith("/api/") || req.url.startsWith("/socket.io")
    ? `http://localhost:${API_PORT}`
    : `http://localhost:${WEB_PORT}`;
}

const proxy = createProxyServer({
  ws: true,
  changeOrigin: true,
  selfHandleResponse: false,
});

proxy.on("error", (err, _req, res) => {
  console.error("Proxy error:", err.message);
  if ("writeHead" in res) res.writeHead(502).end("Bad Gateway");
});

proxy.on("proxyReq", (_proxyReq, req) => {
  const target = targetFor(req);
  _proxyReq.setHeader("host", `localhost:${target.endsWith(String(API_PORT)) ? API_PORT : WEB_PORT}`);
});

const server = createServer(httpsOptions, (req, res) => {
  proxy.web(req, res, { target: targetFor(req) });
});

server.on("upgrade", (req, socket, head) => {
  proxy.ws(req, socket, head, { target: targetFor(req) });
});

const PORT = 3443;
server.listen(PORT, () => {
  console.log(`🔒 HTTPS proxy running on https://10.252.186.3:${PORT}`);
  console.log(`   → Web pages proxied to http://localhost:${WEB_PORT}`);
  console.log(`   → API/Socket.IO proxied to http://localhost:${API_PORT}`);
});
