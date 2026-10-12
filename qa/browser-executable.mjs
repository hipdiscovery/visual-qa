import fs from "node:fs";
import path from "node:path";

function candidates(env = process.env, platform = process.platform) {
  const explicit = env.CHROME_BIN ? [env.CHROME_BIN] : [];
  if (platform === "darwin") {
    return explicit.concat([
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      "/Applications/Chromium.app/Contents/MacOS/Chromium"
    ]);
  }
  if (platform === "win32") {
    const roots = [env.PROGRAMFILES, env["ProgramFiles(x86)"], env.LOCALAPPDATA].filter(Boolean);
    return explicit.concat(roots.flatMap(root => [
      path.win32.join(root, "Google", "Chrome", "Application", "chrome.exe"),
      path.win32.join(root, "Microsoft", "Edge", "Application", "msedge.exe")
    ]));
  }
  return explicit.concat([
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser"
  ]);
}

export function findBrowser(options = {}) {
  const exists = options.existsSync || fs.existsSync;
  const seen = new Set();
  for (const candidate of candidates(options.env, options.platform)) {
    if (!candidate || seen.has(candidate)) continue;
    seen.add(candidate);
    if (exists(candidate)) return candidate;
  }
  return null;
}
