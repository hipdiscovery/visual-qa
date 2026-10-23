import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const candidates = process.platform === "win32"
  ? [["py", ["-3"]], ["python3", []], ["python", []]]
  : [["python3", []], ["python", []], ["py", ["-3"]]];
const checker = fileURLToPath(new URL("./checkFileSizes.py", import.meta.url));
const probeCode = "import sys; print(sys.version_info[0])";

for (const [command, prefix] of candidates) {
  // A Windows Store alias can exist on PATH yet not be an interpreter.
  // Probe separately so only discovery failures permit trying another command.
  const probe = spawnSync(command, [...prefix, "-c", probeCode], {
    encoding: "utf8", timeout: 5000, windowsHide: true
  });
  if (probe.error || probe.status !== 0 || probe.stdout.trim() !== "3") continue;

  const result = spawnSync(command, [...prefix, checker], {
    stdio: "inherit", windowsHide: true
  });
  if (result.error) {
    console.error(`${command} could not run the file-size check: ${result.error.message}`);
    process.exit(2);
  }
  // Never retry a genuine checker failure or interruption with a different Python.
  process.exit(result.status ?? 2);
}

console.error("A working Python 3 was not found; install it or expose python3, python, or py on PATH.");
process.exit(2);
