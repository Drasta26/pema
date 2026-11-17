// The model writes [pause 2s] cues for spoken pacing; they are not shown on screen
export function stripPauseMarkers<T>(value: T): T {
  if (typeof value === "string") return value.replace(/\s*\[pause[^\]]*\]\s*/gi, " ").replace(/\s+/g, " ").trim() as T;
  if (Array.isArray(value)) return value.map(stripPauseMarkers) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, stripPauseMarkers(v)])) as T;
  }
  return value;
}
