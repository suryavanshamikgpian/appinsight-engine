const allowedChatRoles = new Set(['user', 'assistant'])

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) {
    return []
  }

  return messages
    .filter(
      (message) =>
        allowedChatRoles.has(message?.role) &&
        typeof message?.content === 'string' &&
        message.content.trim(),
    )
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }))
    .slice(-20)
}

export function validateChatPayload(body) {
  const errors = []
  const messages = normalizeMessages(body?.messages)
  const requestId = typeof body?.requestId === 'string' ? body.requestId : ''
  const apiKey = typeof body?.apiKey === 'string' ? body.apiKey.trim() : ''

  if (!requestId.trim()) {
    errors.push('requestId is required.')
  }

  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    errors.push('messages must end with a user message.')
  }

  if (errors.length) {
    return { errors }
  }

  return {
    errors,
    value: {
      requestId: requestId.trim(),
      apiKey,
      messages,
    },
  }
}
