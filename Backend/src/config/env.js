import 'dotenv/config'

function parseList(value) {
  if (!value) {
    return []
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export const env = {
  port: Number(process.env.PORT || 5050),
  clientOrigins: parseList(process.env.CLIENT_ORIGIN),
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  openAiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
}
