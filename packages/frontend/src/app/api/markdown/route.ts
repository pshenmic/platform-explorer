import { endpointMarkdown, readDocumentation } from '../documentation'

export async function GET(request: Request) {
  const { introduction, sections } = await readDocumentation()
  const id = new URL(request.url).searchParams.get('endpoint')
  const selected = id === null ? sections : sections.filter(section => section.id === id)
  if (!selected.length) return new Response('Endpoint not found', { status: 404 })
  const markdown = `${id === null ? `${introduction}\n` : ''}${selected.map(endpointMarkdown).join('\n---\n\n')}`
  return new Response(markdown, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
  })
}
