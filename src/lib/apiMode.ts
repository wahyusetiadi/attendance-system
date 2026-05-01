export type ApiMode = "mock" | "real";

export function getApiMode(): ApiMode {
  const mode = process.env.NEXT_PUBLIC_API_MODE;
  return mode === "real" ? "real" : "mock";
}

