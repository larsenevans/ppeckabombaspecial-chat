export const MISTRAL_MODEL_ID = "mistral-small-latest" as const

export type AIModel = "google/gemini-2.0-flash-001" | "openai/gpt-4o" | "anthropic/claude-sonnet-4" | typeof MISTRAL_MODEL_ID
