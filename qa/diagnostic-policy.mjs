// JavaScript exceptions make a render incomplete even when screenshots exist.
export function pageErrorIssues(pageErrors) {
  return Array.isArray(pageErrors) && pageErrors.length
    ? [`JavaScript page errors: ${pageErrors.length}`]
    : [];
}


// Deliberately horizontally scrollable child chips may sit partly outside
// the viewport until the owner swipes. Keep real offscreen content warnings,
// but don't misclassify those children as broken layout.
export function classifyEdgeCollisions(collisions) {
  const rows = Array.isArray(collisions) ? collisions : [];
  const actionable = rows.filter(row => !row?.intentionalHorizontalScroll);
  return {
    actionable,
    intentionalScrollChildren: rows.length - actionable.length
  };
}
