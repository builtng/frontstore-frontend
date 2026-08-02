// fetch() only throws for network-level failures (dropped connection, DNS, CORS) —
// it resolves normally for 4xx/5xx. A single retry after a short delay smooths over
// the transient drops mobile networks produce without masking real HTTP errors.
export async function resilientFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
  retries = 1,
): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (err) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return resilientFetch(input, init, retries - 1);
    }
    throw new Error('Network error — please check your connection and try again.');
  }
}
