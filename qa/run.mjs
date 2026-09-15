import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import { chromium } from "playwright-core";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "out");
const requestPath = process.argv[2] || "qa-request.json";
const targets = JSON.parse(fs.readFileSync(path.join(ROOT, "qa/targets.json"), "utf8"));
const request = JSON.parse(fs.readFileSync(path.resolve(ROOT, requestPath), "utf8"));

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

function fail(message) {
  const payload = { ok: false, error: String(message), generatedAt: new Date().toISOString() };
  fs.writeFileSync(path.join(OUT, "fatal.json"), JSON.stringify(payload, null, 2));
  fs.writeFileSync(path.join(OUT, "summary.md"), `# Visual QA failed\n\n${String(message)}\n`);
  console.error(message);
  process.exit(2);
}

function validateRequest() {
  const allowedKeys = new Set(["requestId", "target", "path", "selector", "viewports", "fullPage", "waitMs"]);
  for (const key of Object.keys(request)) {
    if (!allowedKeys.has(key)) fail(`Unsupported request field: ${key}`);
  }

  if (typeof request.requestId !== "string" || !/^[A-Za-z0-9._-]{1,80}$/.test(request.requestId)) {
    fail("requestId must be 1-80 safe filename characters.");
  }
  if (typeof request.target !== "string" || !targets[request.target]) fail("Unknown target.");
  if (typeof request.path !== "string" || request.path.length < 1 || request.path.length > 300) fail("Invalid path.");
  if (!request.path.startsWith("/") || request.path.startsWith("//")) fail("Path must be root-relative and cannot be protocol-relative.");
  if (/[?#\\\u0000-\u001f]/.test(request.path) || request.path.includes("://")) {
    fail("Path cannot contain a query string, fragment, backslash, control character, or protocol.");
  }
  if (request.selector != null && (typeof request.selector !== "string" || request.selector.length < 1 || request.selector.length > 220)) {
    fail("selector must be 1-220 characters when supplied.");
  }
  if (!Array.isArray(request.viewports) || request.viewports.length < 1 || request.viewports.length > 6) {
    fail("viewports must contain 1-6 configured viewport names.");
  }
  if (new Set(request.viewports).size !== request.viewports.length) fail("viewports cannot contain duplicates.");
  const target = targets[request.target];
  for (const viewportName of request.viewports) {
    if (!target.viewports[viewportName]) fail(`Unknown viewport: ${viewportName}`);
  }
  if (request.fullPage != null && typeof request.fullPage !== "boolean") fail("fullPage must be boolean.");
  if (request.waitMs != null && (!Number.isInteger(request.waitMs) || request.waitMs < 0 || request.waitMs > 2500)) {
    fail("waitMs must be an integer from 0 to 2500.");
  }
}

function isBlockedHost(hostname) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!host) return false;
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return true;

  const ipVersion = net.isIP(host);
  if (ipVersion === 4) {
    const [a, b] = host.split(".").map(Number);
    if (a === 0 || a === 10 || a === 127 || a >= 224) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a === 198 && (b === 18 || b === 19)) return true;
  }
  if (ipVersion === 6) {
    const compact = host.replace(/^0+/, "");
    if (host === "::" || host === "::1" || compact === "::1") return true;
    if (host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe8") || host.startsWith("fe9") || host.startsWith("fea") || host.startsWith("feb")) return true;
  }
  return false;
}

function safeUrl(raw) {
  try {
    const url = new URL(raw);
    url.username = "";
    url.password = "";
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return "[invalid-url]";
  }
}

function scrubMessage(value) {
  let text = String(value || "");
  text = text.replace(/https?:\/\/[^\s"'<>]+/gi, match => safeUrl(match));
  text = text.replace(/\b(token|key|secret|authorization|password)\s*[:=]\s*[^\s,;]+/gi, "$1=[redacted]");
  return text.slice(0, 240);
}

function targetAllows(target, rawUrl) {
  try {
    const u = new URL(rawUrl);
    return u.protocol === "https:" && target.allowedHosts.includes(u.hostname.toLowerCase()) && !u.username && !u.password;
  } catch {
    return false;
  }
}

function selectorHint(el) {
  if (!(el instanceof Element)) return "";
  if (el.id) return `#${CSS.escape(el.id)}`;
  const cls = [...el.classList].slice(0, 2).map(v => `.${CSS.escape(v)}`).join("");
  return `${el.tagName.toLowerCase()}${cls}`;
}

validateRequest();

const target = targets[request.target];
const base = new URL(target.baseUrl);
const url = new URL(request.path, base);
if (!targetAllows(target, url.toString())) fail("Resolved target URL is outside the allowlist.");

const executablePath = process.env.CHROME_BIN || "/usr/bin/google-chrome";
if (!fs.existsSync(executablePath)) fail(`Chrome not found at ${executablePath}`);

const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ["--disable-dev-shm-usage", "--no-first-run", "--no-default-browser-check"]
});

const report = {
  ok: true,
  request: {
    requestId: request.requestId,
    target: request.target,
    path: request.path,
    selector: request.selector || null,
    viewports: request.viewports,
    fullPage: request.fullPage === true,
    waitMs: request.waitMs ?? 700
  },
  generatedAt: new Date().toISOString(),
  browser: await browser.version(),
  results: []
};

try {
  for (const viewportName of request.viewports) {
    const viewport = target.viewports[viewportName];
    const isMobile = viewport.width <= 500;
    const consoleEvents = [];
    const pageErrors = [];
    const failedRequests = [];
    const badResponses = [];

    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      screen: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      isMobile,
      hasTouch: isMobile,
      locale: "en-US",
      timezoneId: "America/Chicago",
      colorScheme: "dark",
      reducedMotion: "reduce",
      serviceWorkers: "block",
      acceptDownloads: false
    });

    const page = await context.newPage();
    page.setDefaultTimeout(6000);

    await page.route("**/*", async route => {
      const reqUrl = route.request().url();
      try {
        const parsed = new URL(reqUrl);
        if ((parsed.protocol === "http:" || parsed.protocol === "https:") && isBlockedHost(parsed.hostname)) {
          await route.abort("blockedbyclient");
          return;
        }
      } catch {}
      await route.continue();
    });

    page.on("console", msg => {
      if (msg.type() === "error" || msg.type() === "warning") {
        consoleEvents.push({ type: msg.type(), message: scrubMessage(msg.text()) });
      }
    });
    page.on("pageerror", error => pageErrors.push(scrubMessage(error?.message || error)));
    page.on("requestfailed", req => {
      let hostAllowed = false;
      try { hostAllowed = target.allowedHosts.includes(new URL(req.url()).hostname.toLowerCase()); } catch {}
      if (hostAllowed) failedRequests.push({ url: safeUrl(req.url()), reason: scrubMessage(req.failure()?.errorText || "failed") });
    });
    page.on("response", response => {
      if (response.status() < 400) return;
      let hostAllowed = false;
      try { hostAllowed = target.allowedHosts.includes(new URL(response.url()).hostname.toLowerCase()); } catch {}
      if (hostAllowed) badResponses.push({ url: safeUrl(response.url()), status: response.status() });
    });

    const response = await page.goto(url.toString(), { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForLoadState("load", { timeout: 8000 }).catch(() => {});

    if (!targetAllows(target, page.url())) {
      await context.close();
      fail(`Final navigation left the allowlist: ${safeUrl(page.url())}`);
    }

    await page.evaluate(async () => {
      if (document.fonts?.ready) await document.fonts.ready.catch(() => {});
      const pending = [...document.images].filter(img => !img.complete);
      if (!pending.length) return;
      await Promise.race([
        Promise.all(pending.map(img => new Promise(resolve => {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        }))),
        new Promise(resolve => setTimeout(resolve, 1800))
      ]);
    }).catch(() => {});

    const waitMs = request.waitMs ?? 700;
    if (waitMs) await page.waitForTimeout(waitMs);

    let focus = null;
    if (request.selector) {
      const locator = page.locator(request.selector).first();
      if (await locator.count()) {
        await locator.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(200);
        focus = locator;
      }
    }

    const diagnostics = await page.evaluate(({ selector }) => {
      const root = document.documentElement;
      const body = document.body;
      const all = [...document.querySelectorAll("body *")];
      const clipped = [];
      const edgeCollisions = [];
      const tinyInteractive = [];

      for (const el of all) {
        const style = getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) continue;
        const rect = el.getBoundingClientRect();
        if (rect.width <= 1 || rect.height <= 1) continue;

        const overflowX = style.overflowX;
        const overflowY = style.overflowY;
        const hiddenX = overflowX === "hidden" || overflowX === "clip";
        const hiddenY = overflowY === "hidden" || overflowY === "clip";
        if (clipped.length < 20 && ((hiddenX && el.scrollWidth > el.clientWidth + 2) || (hiddenY && el.scrollHeight > el.clientHeight + 2))) {
          clipped.push({
            node: selectorHint(el),
            client: [Math.round(el.clientWidth), Math.round(el.clientHeight)],
            scroll: [Math.round(el.scrollWidth), Math.round(el.scrollHeight)],
            overflow: [overflowX, overflowY]
          });
        }

        if (edgeCollisions.length < 20 && rect.left < innerWidth && rect.right > 0 && (rect.left < -2 || rect.right > innerWidth + 2)) {
          edgeCollisions.push({
            node: selectorHint(el),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width)
          });
        }

        if (tinyInteractive.length < 20 && el.matches("a,button,input,select,textarea,[role='button'],[role='link']") && rect.width < 24 && rect.height < 24) {
          tinyInteractive.push({
            node: selectorHint(el),
            size: [Math.round(rect.width), Math.round(rect.height)]
          });
        }
      }

      const brokenImages = [...document.images]
        .filter(img => img.complete && img.naturalWidth === 0 && img.getBoundingClientRect().width > 0 && img.getBoundingClientRect().height > 0)
        .slice(0, 20)
        .map(img => ({ node: selectorHint(img), src: img.currentSrc ? new URL(img.currentSrc, location.href).pathname : "" }));

      let focusRect = null;
      if (selector) {
        const el = document.querySelector(selector);
        if (el) {
          const r = el.getBoundingClientRect();
          focusRect = {
            top: Math.round(r.top),
            left: Math.round(r.left),
            right: Math.round(r.right),
            bottom: Math.round(r.bottom),
            width: Math.round(r.width),
            height: Math.round(r.height)
          };
        }
      }

      return {
        viewport: [innerWidth, innerHeight],
        document: {
          scrollWidth: Math.max(root.scrollWidth, body?.scrollWidth || 0),
          scrollHeight: Math.max(root.scrollHeight, body?.scrollHeight || 0)
        },
        horizontalOverflowPx: Math.max(0, Math.max(root.scrollWidth, body?.scrollWidth || 0) - innerWidth),
        clipped,
        edgeCollisions,
        tinyInteractive,
        brokenImages,
        focusRect
      };
    }, { selector: request.selector || null });

    const slug = viewportName.replace(/[^A-Za-z0-9_-]/g, "-");
    const viewportFile = `viewport-${slug}.jpg`;
    await page.screenshot({
      path: path.join(OUT, viewportFile),
      type: "jpeg",
      quality: 86,
      fullPage: false,
      scale: "css"
    });

    let focusFile = null;
    if (focus) {
      focusFile = `focus-${slug}.jpg`;
      await focus.screenshot({
        path: path.join(OUT, focusFile),
        type: "jpeg",
        quality: 88,
        scale: "css"
      }).catch(() => { focusFile = null; });
    }

    let fullPageFile = null;
    if (request.fullPage === true) {
      fullPageFile = `full-${slug}.jpg`;
      await page.screenshot({
        path: path.join(OUT, fullPageFile),
        type: "jpeg",
        quality: 80,
        fullPage: true,
        scale: "css"
      });
    }

    const warnings = [];
    if (diagnostics.horizontalOverflowPx > 2) warnings.push(`horizontal overflow: ${diagnostics.horizontalOverflowPx}px`);
    if (diagnostics.brokenImages.length) warnings.push(`broken visible images: ${diagnostics.brokenImages.length}`);
    if (consoleEvents.some(e => e.type === "error")) warnings.push(`console errors: ${consoleEvents.filter(e => e.type === "error").length}`);
    if (pageErrors.length) warnings.push(`page errors: ${pageErrors.length}`);
    if (failedRequests.length) warnings.push(`failed first-party requests: ${failedRequests.length}`);
    if (badResponses.length) warnings.push(`first-party HTTP 4xx/5xx responses: ${badResponses.length}`);
    if (request.selector && !focus) warnings.push("focus selector not found");

    report.results.push({
      viewport: viewportName,
      size: viewport,
      status: response?.status() ?? null,
      finalUrl: safeUrl(page.url()),
      title: await page.title(),
      files: { viewport: viewportFile, focus: focusFile, fullPage: fullPageFile },
      diagnostics,
      console: consoleEvents.slice(0, 20),
      pageErrors: pageErrors.slice(0, 20),
      failedRequests: failedRequests.slice(0, 20),
      badResponses: badResponses.slice(0, 20),
      warnings
    });

    await context.close();
  }
} catch (error) {
  report.ok = false;
  report.error = scrubMessage(error?.stack || error);
} finally {
  await browser.close();
}

fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));

const warningCount = report.results.reduce((sum, result) => sum + result.warnings.length, 0);
const lines = [
  "# Visual QA",
  "",
  `- Request: \`${report.request.requestId}\``,
  `- Target: \`${report.request.target}${report.request.path}\``,
  `- Browser: \`${report.browser}\``,
  `- Viewports rendered: **${report.results.length}**`,
  `- Diagnostic warnings: **${warningCount}**`,
  ""
];

for (const result of report.results) {
  lines.push(`## ${result.viewport} — ${result.size.width}×${result.size.height}`);
  lines.push(`- Screenshot: \`${result.files.viewport}\``);
  if (result.files.focus) lines.push(`- Focus screenshot: \`${result.files.focus}\``);
  if (result.files.fullPage) lines.push(`- Full page: \`${result.files.fullPage}\``);
  lines.push(`- Horizontal overflow: ${result.diagnostics.horizontalOverflowPx}px`);
  lines.push(`- Broken visible images: ${result.diagnostics.brokenImages.length}`);
  lines.push(`- Clipping candidates: ${result.diagnostics.clipped.length}`);
  if (result.warnings.length) lines.push(`- Warnings: ${result.warnings.join("; ")}`);
  lines.push("");
}

lines.push("Automated diagnostics are hints. Visual verification requires inspecting the screenshots.");
fs.writeFileSync(path.join(OUT, "summary.md"), lines.join("\n") + "\n");

console.log(`Rendered ${report.results.length} viewport(s); ${warningCount} diagnostic warning(s).`);
if (!report.ok) {
  console.error(report.error || "Visual QA failed.");
  process.exit(2);
}
