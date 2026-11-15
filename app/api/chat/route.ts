import { createMistral } from "@ai-sdk/mistral"
import { streamText, type ModelMessage } from "ai"
import { MISTRAL_MODEL_ID } from "@/lib/ai-models"

/**
 * POST /api/chat
 *
 * This route streams chat responses from the selected gateway model or Mistral using the user's API key.
 */
export async function POST(req: Request) {
  let isMistralRequest = false

  try {
    const { messages, model, mistralApiKey } = await req.json()
    isMistralRequest = model === MISTRAL_MODEL_ID

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid request: messages array required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const apiKey = typeof mistralApiKey === "string" ? mistralApiKey.trim() : ""

    if (isMistralRequest && !apiKey) {
      return new Response(JSON.stringify({ error: "Add your Mistral API key to use this model." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (isMistralRequest && apiKey.length > 512) {
      return new Response(JSON.stringify({ error: "The Mistral API key is too long." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const selectedModel = isMistralRequest
      ? createMistral({ apiKey })(MISTRAL_MODEL_ID)
      : model || "google/gemini-2.0-flash-001"

    const lastIndex = messages.length - 1
    const validMessages: ModelMessage[] = messages.flatMap((message: unknown, index: number): ModelMessage[] => {
      if (!message || typeof message !== "object") return []

      const candidate = message as { role?: unknown; content?: unknown; imageData?: unknown }
      if (candidate.role !== "user" && candidate.role !== "assistant") return []

      const role = candidate.role
      const content = typeof candidate.content === "string" ? candidate.content : ""
      const imageData = typeof candidate.imageData === "string" ? candidate.imageData : undefined
      const isLastUserMessage = index === lastIndex && role === "user"

      if (isLastUserMessage && imageData?.startsWith("data:image/")) {
        return [
          {
            role: "user",
            content: [
              { type: "image", image: imageData },
              { type: "text", text: content || "Describe this image in detail." },
            ],
          },
        ]
      }

      const textContent = imageData && !isLastUserMessage ? content || "[User shared an image]" : content
      if (!textContent.trim()) return []

      if (role === "user") {
        return [{ role: "user", content: textContent }]
      }

      return [{ role: "assistant", content: textContent }]
    })

    if (validMessages.length === 0) {
      return new Response(JSON.stringify({ error: "No valid messages to process" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const result = streamText({
      model: selectedModel,
      messages: validMessages,
      system: `You are a helpful, friendly AI assistant. You provide clear, concise, and accurate responses. 
When explaining code or technical concepts, use markdown formatting with code blocks where appropriate.
Be conversational but professional. If you're unsure about something, say so honestly.
When analyzing images, describe them in detail and answer any questions about them.`,
      onError({ error }) {
        if (isMistralRequest) {
          console.error("Mistral stream error:", error instanceof Error ? error.name : "Unknown error")
          return
        }

        console.error("AI stream error:", error)
      },
    })

    return result.toTextStreamResponse()
  } catch (error) {
    if (isMistralRequest) {
      console.error("Mistral chat API error:", error instanceof Error ? error.name : "Unknown error")
      return new Response(
        JSON.stringify({ error: "Mistral request failed. Check the API key and account access." }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }

    console.error("Chat API error:", error)

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
