// fetch() only throws for network-level failures (dropped connection, DNS, CORS) —
// it resolves normally for 4xx/5xx. A single retry after a short delay smooths over
// the transient drops mobile networks produce without masking real HTTP errors.
export async function resilientFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
  retries = 1,
): Promise<Response> {
  const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;

  try {
    const res = await fetch(input, init);
    if (res.ok || res.status === 422 || res.status === 401 || res.status === 400 || res.status === 403) {
      return res;
    }
    // If we hit a 404 on localhost, try alternative candidate ports (8002, 8001, 8000)
    if (res.status === 404 && typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      const match = urlStr.match(/:(8000|8001|8002|8003)\//);
      if (match) {
        const currentPort = match[1];
        const candidatePorts = ['8002', '8001', '8000'].filter(p => p !== currentPort);
        for (const port of candidatePorts) {
          const altUrl = urlStr.replace(`:${currentPort}/`, `:${port}/`);
          try {
            const altRes = await fetch(altUrl, init);
            if (altRes.ok || (altRes.status !== 404 && altRes.status < 500)) {
              localStorage.setItem('dev_api_url', `http://127.0.0.1:${port}/api`);
              return altRes;
            }
          } catch {
            // try next candidate
          }
        }
      }
    }
    return res;
  } catch (err) {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      const match = urlStr.match(/:(8000|8001|8002|8003)\//);
      if (match) {
        const currentPort = match[1];
        const candidatePorts = ['8002', '8001', '8000'].filter(p => p !== currentPort);
        for (const port of candidatePorts) {
          const altUrl = urlStr.replace(`:${currentPort}/`, `:${port}/`);
          try {
            const altRes = await fetch(altUrl, init);
            if (altRes.ok || altRes.status < 500) {
              localStorage.setItem('dev_api_url', `http://127.0.0.1:${port}/api`);
              return altRes;
            }
          } catch {
            // ignore fallback failure and try next candidate
          }
        }
      }
    }
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return resilientFetch(input, init, retries - 1);
    }
    throw err;
  }
}
