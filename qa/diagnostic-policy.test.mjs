import assert from "node:assert/strict";
import { pageErrorIssues } from "./diagnostic-policy.mjs";

assert.deepEqual(pageErrorIssues([]), [], "clean pages must remain eligible to pass");
assert.deepEqual(pageErrorIssues(["Unexpected token ';'"]), ["JavaScript page errors: 1"],
  "the observed analytics parse failure must reject a rendered page");
assert.deepEqual(pageErrorIssues(["SyntaxError", "ReferenceError"]), ["JavaScript page errors: 2"]);
assert.deepEqual(pageErrorIssues(null), [], "missing errors must not crash diagnostics");
console.log("Visual QA JavaScript error policy: ok");
