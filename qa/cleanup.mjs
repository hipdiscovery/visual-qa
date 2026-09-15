const token = process.env.GH_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const currentRun = Number(process.env.GITHUB_RUN_ID || 0);

if (!token || !repository || !currentRun) {
  console.warn("Cleanup skipped: required GitHub context is unavailable.");
  process.exit(0);
}

const base = "https://api.github.com";
const headers = {
  "Accept": "application/vnd.github+json",
  "Authorization": `Bearer ${token}`,
  "X-GitHub-Api-Version": "2026-03-10",
  "User-Agent": "hipdiscovery-visual-qa-cleanup"
};

async function api(path, init = {}) {
  const response = await fetch(base + path, { ...init, headers: { ...headers, ...(init.headers || {}) } });
  if (response.status === 204) return null;
  const text = await response.text();
  if (!response.ok) throw new Error(`${init.method || "GET"} ${path}: ${response.status} ${text.slice(0, 180)}`);
  return text ? JSON.parse(text) : null;
}

let deletedArtifacts = 0;
let deletedRuns = 0;

try {
  const artifacts = await api(`/repos/${repository}/actions/artifacts?per_page=100`);
  const currentArtifact = (artifacts?.artifacts || []).find(artifact =>
    artifact?.name === `visual-qa-${currentRun}` && artifact.workflow_run?.id === currentRun
  );

  if (!currentArtifact) {
    console.warn("Cleanup preserved previous QA output because this run did not produce its own artifact.");
    process.exit(0);
  }

  for (const artifact of artifacts?.artifacts || []) {
    if (!artifact?.name?.startsWith("visual-qa-")) continue;
    if (artifact.id === currentArtifact.id) continue;
    await api(`/repos/${repository}/actions/artifacts/${artifact.id}`, { method: "DELETE" });
    deletedArtifacts++;
  }

  const runs = await api(`/repos/${repository}/actions/workflows/visual-qa.yml/runs?per_page=100`);
  for (const run of runs?.workflow_runs || []) {
    if (run.id === currentRun || run.status !== "completed") continue;
    await api(`/repos/${repository}/actions/runs/${run.id}`, { method: "DELETE" });
    deletedRuns++;
  }

  console.log(`Cleanup removed ${deletedArtifacts} prior artifact(s) and ${deletedRuns} prior completed run(s).`);
} catch (error) {
  console.warn(`Cleanup warning: ${error.message}`);
  console.warn("Current artifacts still have a one-day retention fallback.");
}
