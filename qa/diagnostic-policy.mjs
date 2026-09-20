// JavaScript exceptions make a render incomplete even when screenshots exist.
export function pageErrorIssues(pageErrors) {
  return Array.isArray(pageErrors) && pageErrors.length
    ? [`JavaScript page errors: ${pageErrors.length}`]
    : [];
}
