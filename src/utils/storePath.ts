// Custom domains are served by rewriting the request internally to
// /{host}/... (see src/proxy.ts), so `username` here is the raw hostname
// instead of a slug when a merchant is on their own domain. Real usernames
// (Str::slug'd server-side) never contain a dot, so that's what we key off
// to avoid re-prefixing links with the domain the browser is already on.
export function storePath(username: string, path: string = ""): string {
  return username.includes(".") ? path || "/" : `/${username}${path}`;
}
