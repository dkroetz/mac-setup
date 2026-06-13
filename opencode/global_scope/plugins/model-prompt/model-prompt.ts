import type { Plugin } from "@opencode-ai/plugin"
import { readdirSync, readFileSync } from "fs"
import { join } from "path"

interface PromptConfig {
  model: string
  provider?: string
  prompt: string
}

function parseFrontmatter(content: string): { metadata: Record<string, string>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { metadata: {}, body: content }

  const metadata: Record<string, string> = {}
  for (const line of match[1].split("\n")) {
    const colon = line.indexOf(":")
    if (colon === -1) continue
    metadata[line.slice(0, colon).trim()] = line.slice(colon + 1).trim()
  }

  return { metadata, body: match[2].trim() }
}

function loadPrompts(promptsDir: string): PromptConfig[] {
  const files = readdirSync(promptsDir).filter((f) => f.endsWith(".md"))
  return files
    .map((file) => {
      const content = readFileSync(join(promptsDir, file), "utf-8")
      const { metadata, body } = parseFrontmatter(content)
      return { model: metadata.model, provider: metadata.provider, prompt: body }
    })
    .filter((cfg): cfg is PromptConfig => Boolean(cfg.model && cfg.prompt))
}

export default (async () => {
  const promptsDir = join(import.meta.dirname!, "prompts")
  const prompts = loadPrompts(promptsDir)

  return {
    "experimental.chat.system.transform": async (input, output) => {
      for (const cfg of prompts) {
        // Match on model id (bare name like "deepseek-v4-flash")
        const idMatch =
          input.model.id === cfg.model ||
          input.model.api?.id === cfg.model

        if (!idMatch) continue

        // Only check provider if one is specified in the prompt file
        if (cfg.provider && input.model.providerID !== cfg.provider) continue

        output.system.splice(1, 0, cfg.prompt)
        break
      }
    },
  }
}) satisfies Plugin
