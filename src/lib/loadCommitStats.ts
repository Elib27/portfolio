import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export interface Count {
  label: string
  value: number
}

interface CommitLine {
  messages: { role: string; content: string }[]
  meta: { repo: string; hash: string }
}

const CONVENTIONAL_TYPE = /^(\w+)(\([^)]*\))?!?:/

function toCounts(counter: Map<string, number>): Count[] {
  return [...counter.entries()].map(([label, value]) => ({ label, value }))
}

/**
 * Reads the raw training dataset at build time and aggregates it into
 * commit-type and repo distributions. The JSONL is read with `fs` (never
 * imported) so the ~37 MB file is not bundled into the client.
 */
export function loadCommitStats(): {
  types: Count[]
  repos: Count[]
  messageLengths: number[]
  diffLengths: number[]
} {
  const path = join(process.cwd(), 'src/data/commits.jsonl')
  const raw = readFileSync(path, 'utf-8')

  const types = new Map<string, number>()
  const repos = new Map<string, number>()
  const messageLengths: number[] = []
  const diffLengths: number[] = []

  for (const line of raw.split('\n')) {
    if (!line.trim()) continue
    const entry = JSON.parse(line) as CommitLine

    const repo = entry.meta.repo
    repos.set(repo, (repos.get(repo) ?? 0) + 1)

    const diff = entry.messages[0]?.content ?? ''
    const message = entry.messages[1]?.content ?? ''
    diffLengths.push(diff.length)
    messageLengths.push(message.length)

    const match = CONVENTIONAL_TYPE.exec(message.trim())
    const type = match ? match[1].toLowerCase() : 'other'
    types.set(type, (types.get(type) ?? 0) + 1)
  }

  return { types: toCounts(types), repos: toCounts(repos), messageLengths, diffLengths }
}
