const { spawn } = require("child_process");
const child = spawn("npx", ["next", "dev", "-p", "3001"], {
  cwd: "G:\\App\\apps\\web",
  stdio: "inherit",
  shell: true,
});
child.on("exit", (code) => process.exit(code));
