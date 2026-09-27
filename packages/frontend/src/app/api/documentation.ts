import { readFile } from 'fs/promises'
import path from 'path'

export async function readDocumentation() {
  const content = await readFile(path.join(process.cwd(), 'src/app/api/content.md'), 'utf8')
  const referenceStart = content.indexOf('Reference:')
  const referenceEnd = content.indexOf('### ', referenceStart)
  const introduction = content.slice(0, referenceStart)
  const sections = content
    .slice(referenceEnd)
    .split(/^### /m)
    .filter(Boolean)
    .map(section => {
      const newline = section.indexOf('\n')
      const title = section.slice(0, newline).trim()
      const endpoint = /<!-- endpoint: (GET|POST) (\S+) -->/.exec(section)
      const body = section
        .slice(newline + 1)
        .replace(/<!-- endpoint: .*? -->\n?/, '')
        .replace(/\n(?:---|___)\s*$/, '')
        .trim()
      return {
        title,
        body,
        id: title.toLowerCase().replace(/\W/g, '-'),
        method: endpoint?.[1],
        path: endpoint?.[2]
      }
    })
  return { introduction, sections }
}

export function endpointMarkdown(
  section: Awaited<ReturnType<typeof readDocumentation>>['sections'][number]
) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '')
  return `# ${section.title}\n\n${section.method} ${section.path}\n\n${baseUrl ? `Base URL: ${baseUrl}\n\n` : ''}${section.body}\n`
}
