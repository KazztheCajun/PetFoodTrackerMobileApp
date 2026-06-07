export function formatFedAt(timestamp: number): string
{
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)

  if (diffHours < 24 && date.getDate() === now.getDate())
  {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (diffHours < 48)
  {
    return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  }

  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function toUnixMs(): number
{
  return Date.now()
}
