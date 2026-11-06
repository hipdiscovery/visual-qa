import net from "node:net";

export function isBlockedHost(hostname) {
  const host = String(hostname).toLowerCase().replace(/^\[|\]$/g, "");
  if (!host) return false;
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return true;
  const version = net.isIP(host);
  if (version === 4) {
    const [a, b] = host.split(".").map(Number);
    return a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) ||
      (a === 198 && (b === 18 || b === 19));
  }
  if (version === 6) {
    const canonical = new URL(`http://[${host}]/`).hostname.slice(1, -1);
    const mapped = canonical.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
    if (mapped) {
      const high = Number.parseInt(mapped[1], 16);
      const low = Number.parseInt(mapped[2], 16);
      return isBlockedHost(`${high >>> 8}.${high & 255}.${low >>> 8}.${low & 255}`);
    }
    return canonical === "::" || canonical === "::1" || /^(fc|fd|fe[89ab])/.test(canonical);
  }
  return false;
}

export function shouldBlockTopLevelNavigation(request, rawUrl, target, targetAllows) {
  if (!request.isNavigationRequest()) return false;
  try {
    if (request.frame().parentFrame()) return false;
  } catch {
    // Popup first requests may not have a frame yet.
  }
  return !targetAllows(target, rawUrl);
}
