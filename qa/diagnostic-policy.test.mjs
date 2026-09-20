import assert from "node:assert/strict";
import { pageErrorIssues, classifyEdgeCollisions } from "./diagnostic-policy.mjs";

assert.deepEqual(pageErrorIssues([]), [], "clean pages must remain eligible to pass");
assert.deepEqual(pageErrorIssues(["Unexpected token ';'"]), ["JavaScript page errors: 1"],
  "the observed analytics parse failure must reject a rendered page");
assert.deepEqual(pageErrorIssues(["SyntaxError", "ReferenceError"]), ["JavaScript page errors: 2"]);
assert.deepEqual(pageErrorIssues(null), [], "missing errors must not crash diagnostics");

const realOverflow = { node: "div.bad-layout", left: -12, right: 980, width: 992 };
const intentionalChip = {
  node: "button.filter-chip", left: 345, right: 425, width: 80,
  intentionalHorizontalScroll: true
};
assert.deepEqual(classifyEdgeCollisions([realOverflow, intentionalChip]), {
  actionable: [realOverflow],
  intentionalScrollChildren: 1
}, "keep genuine viewport overflow while ignoring chips deliberately scrolled out of view");
assert.deepEqual(classifyEdgeCollisions([intentionalChip, intentionalChip]), {
  actionable: [],
  intentionalScrollChildren: 2
}, "intentional scroll chips must not produce misleading viewport warnings");
assert.deepEqual(classifyEdgeCollisions(null), {
  actionable: [], intentionalScrollChildren: 0
}, "missing diagnostics must remain safe");

console.log("Visual QA JavaScript error policy: ok");
