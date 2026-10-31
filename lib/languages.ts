import type { Language } from "@/lib/mock/projects"

/** identity colors per language (GitHub linguist conventions) */
export const LANGUAGE_COLORS: Record<Language, string> = {
  TypeScript: "#3178c6",
  Go: "#00add8",
  Python: "#3572a5",
  Java: "#b07219",
  Kotlin: "#a97bff",
  Swift: "#f05138",
  Rust: "#dea584",
  HCL: "#844fba",
  YAML: "#cb171e",
}
