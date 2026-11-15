"use client"

import { useState, useEffect, useCallback } from "react"
import { KeyRound, MessageSquareDashed, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { MessageList } from "./message-list"
import { Composer } from "./composer"
import { Button } from "@/components/ui/button"
import { MistralKeyDialog } from "./mistral-key-dialog"
import { MISTRAL_MODEL_ID, type AIModel } from "@/lib/ai-models"

// Data model for messages
export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: Date
  imageData?: string
}

// localStorage key for persisting messages
const STORAGE_KEY = "chat-messages"
const MODEL_STORAGE_KEY = "chat-selected-model"

// Generates a unique ID for messages
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function ChatShell() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [selectedModel, setSelectedModel] = useState<AIModel>("google/gemini-2.0-flash-001")
  const [mistralApiKey, setMistralApiKey] = useState("")
  const [mistralApiKeyDraft, setMistralApiKeyDraft] = useState("")
  const [isMistralDialogOpen, setIsMistralDialogOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  // Load messages from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        const messagesWithDates = parsed.map((msg: Message) => ({
          ...msg,
          createdAt: new Date(msg.createdAt),
        }))
        setMessages(messagesWithDates)
      }
      const savedModel = localStorage.getItem(MODEL_STORAGE_KEY) as AIModel | null
      if (savedModel) {
        setSelectedModel(savedModel)
        if (savedModel === MISTRAL_MODEL_ID) {
          setIsMistralDialogOpen(true)
        }
      }
    } catch (e) {
      console.error("Failed to load from localStorage:", e)
    } finally {
      setIsLoaded(true)
      setIsMounted(true)
    }
  }, [])

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch (e) {
      console.error("Failed to save messages to localStorage:", e)
    }
  }, [messages])

  const handleModelChange = useCallback(
    (model: AIModel) => {
      setSelectedModel(model)
      localStorage.setItem(MODEL_STORAGE_KEY, model)

      if (model === MISTRAL_MODEL_ID && !mistralApiKey) {
        setMistralApiKeyDraft("")
        setIsMistralDialogOpen(true)
      }
    },
    [mistralApiKey],
  )

  // Send a message to the AI
  const sendMessage = useCallback(
    async (content: string, imageData?: string) => {
      if ((!content.trim() && !imageData) || isStreaming) return

      if (selectedModel === MISTRAL_MODEL_ID && !mistralApiKey) {
        setIsMistralDialogOpen(true)
        return
      }

      setError(null)

      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content: content.trim() || "Describe this image",
        createdAt: new Date(),
        imageData,
      }

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "",
        createdAt: new Date(),
      }

      const newMessages = [...messages, userMessage, assistantMessage]
      setMessages(newMessages)
      setIsStreaming(true)

      const controller = new AbortController()
      setAbortController(controller)

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
              imageData: m.imageData,
            })),
            model: selectedModel,
            ...(selectedModel === MISTRAL_MODEL_ID ? { mistralApiKey } : {}),
          }),
          signal: controller.signal,
        })

        if (!response.ok) {
          const responseBody = await response.json().catch(() => null)
          throw new Error(
            typeof responseBody?.error === "string" ? responseBody.error : `HTTP error! status: ${response.status}`,
          )
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          throw new Error("No response body")
        }

        let accumulatedContent = ""

        while (true) {
          const { done, value } = await reader.read()

          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          accumulatedContent += chunk

          setMessages((prev) =>
            prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, content: accumulatedContent } : msg)),
          )
        }

        if (!accumulatedContent.trim()) {
          setError(
            selectedModel === MISTRAL_MODEL_ID
              ? "Mistral returned no response. Check the API key, model access, and account credits."
              : "The AI Gateway returned no response. Check your Vercel AI Gateway billing setup and try again.",
          )
          setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessage.id))
          return
        }
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id ? { ...msg, content: msg.content || "[Cancelled]" } : msg,
            ),
          )
        } else {
          console.error("Error sending message:", e)
          setError(
            selectedModel === MISTRAL_MODEL_ID
              ? "Mistral request failed. Check the API key and account access, then try again."
              : e instanceof Error
                ? e.message
                : "An error occurred",
          )
          setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessage.id))
        }
      } finally {
        setIsStreaming(false)
        setAbortController(null)
      }
    },
    [messages, isStreaming, selectedModel, mistralApiKey],
  )

  const retry = useCallback(() => {
    if (messages.length === 0) return
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")
    if (lastUserMessage) {
      const index = messages.findIndex((m) => m.id === lastUserMessage.id)
      setMessages(messages.slice(0, index))
      setError(null)
      setTimeout(() => sendMessage(lastUserMessage.content, lastUserMessage.imageData), 100)
    }
  }, [messages, sendMessage])

  const stopStreaming = useCallback(() => {
    if (abortController) {
      abortController.abort()
    }
  }, [abortController])

  const openMistralSettings = useCallback(() => {
    setMistralApiKeyDraft(mistralApiKey)
    setIsMistralDialogOpen(true)
  }, [mistralApiKey])

  const saveMistralApiKey = useCallback(() => {
    const key = mistralApiKeyDraft.trim()
    if (!key) return

    setMistralApiKey(key)
    setError(null)
    setIsMistralDialogOpen(false)
  }, [mistralApiKeyDraft])

  const removeMistralApiKey = useCallback(() => {
    setMistralApiKey("")
    setMistralApiKeyDraft("")
    setError(null)
    setIsMistralDialogOpen(false)
  }, [])

  const clearChat = useCallback(() => {
    setMessages([])
    setError(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const isDark = isMounted && resolvedTheme === "dark"

  return (
    <main className="relative h-dvh overflow-hidden bg-background text-foreground transition-colors duration-300">
      <header className="absolute inset-x-0 top-0 z-20 flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <span className="text-sm font-semibold tracking-tight">J</span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">Jarvis</p>
            <p className="text-xs text-muted-foreground">AI assistant</p>
          </div>
          <span className="ml-1 hidden items-center gap-1.5 rounded-full border border-border/70 px-2.5 py-1 text-xs text-muted-foreground sm:inline-flex">
            <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            Ready
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            onClick={clearChat}
            variant="ghost"
            size="icon"
            className="size-11 rounded-full text-muted-foreground hover:text-foreground"
            aria-label="Start a new chat"
            title="Start a new chat"
          >
            <MessageSquareDashed className="size-5" />
          </Button>
          <Button
            onClick={openMistralSettings}
            variant="ghost"
            size="icon"
            className={`size-11 rounded-full ${mistralApiKey ? "text-primary" : "text-muted-foreground"}`}
            aria-label={mistralApiKey ? "Mistral API key configured" : "Set Mistral API key"}
            title={mistralApiKey ? "Mistral API key configured" : "Set Mistral API key"}
          >
            <KeyRound className="size-4" />
          </Button>
          <Button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            variant="outline"
            size="icon"
            className="size-11 rounded-full bg-background/80"
            aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
            title={`Switch to ${isDark ? "light" : "dark"} theme`}
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </div>
      </header>

      <MistralKeyDialog
        open={isMistralDialogOpen}
        onOpenChange={setIsMistralDialogOpen}
        apiKeyDraft={mistralApiKeyDraft}
        onApiKeyDraftChange={setMistralApiKeyDraft}
        hasSavedApiKey={Boolean(mistralApiKey)}
        onSave={saveMistralApiKey}
        onRemove={removeMistralApiKey}
      />

      <MessageList messages={messages} isStreaming={isStreaming} error={error} onRetry={retry} isLoaded={isLoaded} />

      <Composer
        onSend={sendMessage}
        onStop={stopStreaming}
        isStreaming={isStreaming}
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
      />
    </main>
  )
}
