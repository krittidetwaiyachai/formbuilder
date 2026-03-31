function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}
function toOrigin(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return stripTrailingSlash(value);
  }
}
export function resolveSocketBaseUrl() {
  const explicitSocketUrl = import.meta.env.VITE_SOCKET_URL as string | undefined;
  if (explicitSocketUrl) {
    return stripTrailingSlash(explicitSocketUrl);
  }
  const backendUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;
  if (backendUrl) {
    return toOrigin(backendUrl);
  }
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (apiUrl) {
    return toOrigin(apiUrl);
  }
  return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
}