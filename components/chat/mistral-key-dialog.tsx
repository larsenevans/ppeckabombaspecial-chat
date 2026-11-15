"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface MistralKeyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  apiKeyDraft: string
  onApiKeyDraftChange: (value: string) => void
  hasSavedApiKey: boolean
  onSave: () => void
  onRemove: () => void
}

export function MistralKeyDialog({
  open,
  onOpenChange,
  apiKeyDraft,
  onApiKeyDraftChange,
  hasSavedApiKey,
  onSave,
  onRemove,
}: MistralKeyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mistral API key</DialogTitle>
          <DialogDescription>
            Paste your personal Mistral key to use Mistral Small. It stays in this tab&apos;s memory, is not saved in
            browser storage, and is cleared when you reload or close the tab.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            onSave()
          }}
          className="flex flex-col gap-5"
        >
          <FieldGroup className="gap-3">
            <Field>
              <FieldLabel htmlFor="mistral-api-key">Mistral API key</FieldLabel>
              <Input
                id="mistral-api-key"
                name="mistral-api-key"
                type="password"
                value={apiKeyDraft}
                onChange={(event) => onApiKeyDraftChange(event.target.value)}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="Paste your API key"
                className="h-11"
              />
              <FieldDescription>
                The key is sent to this app&apos;s server only when you send a message with Mistral selected.
              </FieldDescription>
            </Field>
          </FieldGroup>

          <DialogFooter className="sm:justify-between">
            {hasSavedApiKey ? (
              <Button type="button" variant="ghost" className="min-h-11" onClick={onRemove}>
                Remove key
              </Button>
            ) : (
              <span className="hidden text-xs text-muted-foreground sm:inline">Only kept in this tab</span>
            )}
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button type="button" variant="outline" className="min-h-11" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="min-h-11" disabled={!apiKeyDraft.trim()}>
                Save key
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
