import { env } from '../config/env.js'
import { findReviewAnalysisRecordById } from '../repositories/reviewAnalysis.repository.js'
import { validateChatPayload } from '../schemas/chat.schema.js'
import { HttpError } from '../utils/httpError.js'

function formatList(items) {
  return items.length ? items.join(', ') : 'None'
}

function buildRequestContext(savedRequest) {
  const { analysis, appId, filters, playStoreLink } = savedRequest.request

  return [
    `Play Store URL: ${playStoreLink}`,
    `App ID: ${appId}`,
    `Rating range: ${filters.ratingRange.min}-${filters.ratingRange.max}`,
    `Time range: ${filters.timeRange}`,
    `Minimum review length: ${filters.minimumReviewLength}`,
    `Max reviews limit: ${filters.maxReviewsLimit}`,
    `Remove spam: ${filters.removeSpam}`,
    `Remove duplicates: ${filters.removeDuplicates}`,
    `English only: ${filters.englishOnly}`,
    `Keywords include: ${formatList(filters.keywords.include)}`,
    `Keywords exclude: ${formatList(filters.keywords.exclude)}`,
    `Analysis goal: ${analysis.goal}`,
    `AI output type: ${analysis.aiOutputType}`,
  ].join('\n')
}

function buildChatMessages(savedRequest, messages) {
  return [
    {
      role: 'system',
      content: [
        'You are an app-review research assistant.',
        'Use the saved Play Store review-analysis setup as your context.',
        'Help the user reason about filters, scraping plans, review insights, pain points, feature ideas, and reports.',
        'If real reviews have not been scraped yet, be transparent and work from the provided setup only.',
        '',
        buildRequestContext(savedRequest),
      ].join('\n'),
    },
    ...messages,
  ]
}

async function requestOpenAiCompletion(apiKey, messages) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.openAiModel,
      messages,
      temperature: 0.4,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new HttpError(
      response.status,
      data.error?.message || 'OpenAI request failed.',
      data.error || data,
    )
  }

  return data.choices?.[0]?.message?.content?.trim() || ''
}

export async function createChatReply(payload) {
  const { errors, value } = validateChatPayload(payload)

  if (errors.length) {
    throw new HttpError(400, 'Invalid chat request.', errors)
  }

  const savedRequest = findReviewAnalysisRecordById(value.requestId)

  if (!savedRequest) {
    throw new HttpError(404, 'Review analysis request was not found.')
  }

  const apiKey = value.apiKey || env.openAiApiKey

  if (!apiKey) {
    throw new HttpError(400, 'Enter an OpenAI API key or set OPENAI_API_KEY.')
  }

  const reply = await requestOpenAiCompletion(
    apiKey,
    buildChatMessages(savedRequest, value.messages),
  )

  return {
    requestId: savedRequest.id,
    model: env.openAiModel,
    reply,
  }
}
