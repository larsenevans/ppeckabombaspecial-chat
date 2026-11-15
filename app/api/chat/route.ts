import { streamText, type ModelMessage } from "ai"

/**
 * POST /api/chat
 *
 * This route handler proxies requests to the Vercel AI Gateway.
 * It receives messages from the frontend and streams the AI response back.
 */
export async function POST(req: Request) {
  try {
    const { messages, model } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid request: messages array required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const selectedModel = model || "google/gemini-2.0-flash-001"

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
        console.error("AI stream error:", error)
      },
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
