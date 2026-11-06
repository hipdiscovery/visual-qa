import assert from "node:assert/strict";
import { isBlockedHost, shouldBlockTopLevelNavigation } from "./network-policy.mjs";

for (const address of [
  "localhost", "localhost.local", "127.0.0.1", "10.1.2.3", "172.16.0.1",
  "192.168.1.1", "169.254.10.20", "100.64.0.1", "198.18.0.1",
  "::", "::1", "fc00::1", "fe80::1", "::ffff:127.0.0.1",
  "[::ffff:7f00:1]", "0:0:0:0:0:ffff:7f00:1", "::ffff:c0a8:101"
]) {
  assert.equal(isBlockedHost(address), true, `blocked: ${address}`);
}
for (const address of ["8.8.8.8", "2606:4700:4700::1111", "::ffff:8.8.8.8"]) {
  assert.equal(isBlockedHost(address), false, `public: ${address}`);
}
const target = { allowedHosts: ["allowed.example"] };
const allows = (t, url) => url === "https://allowed.example/";
const top = { isNavigationRequest: () => true, frame: () => ({ parentFrame: () => null }) };
const popup = { isNavigationRequest: () => true, frame: () => { throw Error("not ready"); } };
const child = { isNavigationRequest: () => true, frame: () => ({ parentFrame: () => ({}) }) };
const asset = { isNavigationRequest: () => false };
assert.equal(shouldBlockTopLevelNavigation(top, "https://outside.example/", target, allows), true);
assert.equal(shouldBlockTopLevelNavigation(popup, "https://outside.example/", target, allows), true);
assert.equal(shouldBlockTopLevelNavigation(popup, "https://allowed.example/", target, allows), false);
assert.equal(shouldBlockTopLevelNavigation(child, "https://outside.example/", target, allows), false);
assert.equal(shouldBlockTopLevelNavigation(asset, "https://outside.example/", target, allows), false);
console.log("Visual QA network guards: ok");
