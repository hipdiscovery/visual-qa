import { spawnSync } from "node:child_process";

const candidates = [
  ["python3", []],
  ["python", []],
  ["py", ["-3"]]
];

for (const [command, prefix] of candidates) {
  const result = spawnSync(command, [...prefix, "tools/checkFileSizes.py"], { stdio: "inherit" });
  if (result.error?.code === "ENOENT") continue;
  if (result.error) {
    console.error(`${command} failed to start: ${result.error.message}`);
    process.exit(2);
  }
  process.exit(result.status ?? 2);
}

console.error("Python 3 was not found; install it or expose python3, python, or py on PATH.");
process.exit(2);
