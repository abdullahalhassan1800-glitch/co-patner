const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const fix = path.resolve(__dirname, "../../fs-fix.js");
const env = { ...process.env };

if (fs.existsSync(fix)) {
  const quoted = JSON.stringify(fix);
  env.NODE_OPTIONS = `${env.NODE_OPTIONS || ""} --require ${quoted}`.trim();
}

const result = spawnSync(process.platform === "win32" ? "npx.cmd" : "npx", ["next", "build"], {
  stdio: "inherit",
  shell: true,
  env,
});

process.exit(result.status === null ? 1 : result.status);
