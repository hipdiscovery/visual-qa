// One deadline covers font readiness AND images. This callback runs in the
// isolated browser page, so it must not depend on Node/module closures.
export async function settlePageImages(page, timeoutMs = 1800) {
  try {
    return await page.evaluate(async timeout => {
      const controller = new AbortController();
      let timer;
      const settle = async () => {
        if (document.fonts?.ready) await document.fonts.ready;
        const pending = [...document.images].filter(image => !image.complete);
        await Promise.all(pending.map(image => new Promise(resolve => {
          const done = () => {
            image.removeEventListener("load", done);
            image.removeEventListener("error", done);
            controller.signal.removeEventListener("abort", done);
            resolve();
          };
          image.addEventListener("load", done, { once: true });
          image.addEventListener("error", done, { once: true });
          controller.signal.addEventListener("abort", done, { once: true });
          if (image.complete) done();
        })));
        return true;
      };
      try {
        const ready = await Promise.race([
          settle(),
          new Promise(resolve => { timer = setTimeout(() => resolve(false), timeout); })
        ]);
        return { ready, reason: ready ? null : "Font/image readiness deadline exceeded" };
      } finally {
        clearTimeout(timer);
        controller.abort();
      }
    }, timeoutMs);
  } catch {
    return { ready: false, reason: "Font/image readiness evaluation failed" };
  }
}
