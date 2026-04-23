import { spawn } from "node:child_process";

function run(command, args, name) {
  const proc = spawn(command, args, {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });

  proc.on("exit", (code) => {
    if (code !== 0) {
      // eslint-disable-next-line no-console
      console.error(`[${name}] exited with code ${code}`);
    }
  });

  return proc;
}

const api = run("node", ["--watch", "backend/server.mjs"], "api");
const web = run("vite", [], "web");

function shutdown() {
  api.kill();
  web.kill();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

