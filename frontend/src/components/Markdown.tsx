import { memo, type ReactNode } from 'react'

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function parseInline(text: string): (string | ReactNode)[] {
  const parts: (string | ReactNode)[] = []
  let remaining = escapeHtml(text)
  const regex = /(`+)(.*?)\1|(\*\*)(.*?)\*\*|(\*)(.*?)\*/g
  let last = 0
  let match: RegExpExecArray | null
  while ((match = regex.exec(remaining)) !== null) {
    if (match.index > last) {
      parts.push(remaining.slice(last, match.index))
    }
    if (match[1]) {
      parts.push(<code key={parts.length} className="bg-surface-container-highest px-1.5 py-0.5 rounded text-sm font-mono">{match[2]}</code>)
    } else if (match[3]) {
      parts.push(<strong key={parts.length}>{match[4]}</strong>)
    } else if (match[5]) {
      parts.push(<em key={parts.length}>{match[6]}</em>)
    }
    last = match.index + match[0].length
  }
  if (last < remaining.length) {
    parts.push(remaining.slice(last))
  }
  return parts
}

function isListLine(line: string): boolean {
  return /^(\s*)([-*]|\d+\.)\s/.test(line)
}

const Markdown = memo(function Markdown({ text }: { text: string }) {
  const lines = text.split('\n')
  const elements: ReactNode[] = []
  let key = 0

  function pushParagraph(content: (string | ReactNode)[]) {
    if (content.length === 0) return
    elements.push(<p key={key++} className="mb-2 last:mb-0 leading-relaxed">{content}</p>)
  }

  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    // Code block
    if (line.trimStart().startsWith('```')) {
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      elements.push(
        <pre key={key++} className="bg-surface-container-higher rounded-xl p-4 mb-2 overflow-x-auto text-sm font-mono leading-relaxed">
          <code>{codeLines.join('\n')}</code>
        </pre>
      )
      continue
    }

    // Heading
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3
      const Tag = level === 1 ? 'h2' : level === 2 ? 'h3' : 'h4'
      elements.push(
        <Tag key={key++} className={`font-headline-md text-headline-md text-on-surface mt-4 mb-2 ${level === 3 ? 'text-headline-sm' : ''}`}>
          {parseInline(headingMatch[2])}
        </Tag>
      )
      i++
      continue
    }

    // Unordered list
    if (/^(-|\*)\s/.test(line.trimStart())) {
      const items: (string | ReactNode)[][] = []
      while (i < lines.length && /^(\s*)[-*]\s/.test(lines[i])) {
        items.push(parseInline(lines[i].replace(/^\s*[-*]\s+/, '')))
        i++
      }
      elements.push(
        <ul key={key++} className="list-disc list-inside mb-2 space-y-1">
          {items.map((item, idx) => <li key={idx} className="leading-relaxed">{item}</li>)}
        </ul>
      )
      continue
    }

    // Ordered list
    if (/^\d+\.\s/.test(line.trimStart())) {
      const items: (string | ReactNode)[][] = []
      while (i < lines.length && /^\s*\d+\.\s/.test(lines[i])) {
        items.push(parseInline(lines[i].replace(/^\s*\d+\.\s+/, '')))
        i++
      }
      elements.push(
        <ol key={key++} className="list-decimal list-inside mb-2 space-y-1">
          {items.map((item, idx) => <li key={idx} className="leading-relaxed">{item}</li>)}
        </ol>
      )
      continue
    }

    // Empty line = paragraph break
    if (line.trim() === '') {
      i++
      continue
    }

    // Regular paragraph line
    const paraLines: string[] = []
    while (i < lines.length && lines[i].trim() !== '' && !isListLine(lines[i]) && !lines[i].trimStart().startsWith('```') && !/^#{1,3}\s/.test(lines[i])) {
      paraLines.push(lines[i])
      i++
    }
    if (paraLines.length > 0) {
      const combined = paraLines.join(' ')
      pushParagraph(parseInline(combined))
    }
  }

  return <>{elements}</>
})

export default Markdown
