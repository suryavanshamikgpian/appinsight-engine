import {
  allowedOutputTypes,
  allowedTimeRanges,
  booleanFilterFields,
} from '../constants/reviewOptions.js'
import { getPlayStoreAppId } from '../utils/playStore.js'

function isIntegerInRange(value, min, max) {
  return Number.isInteger(value) && value >= min && value <= max
}

function normalizeKeywords(keywords) {
  if (!Array.isArray(keywords)) {
    return []
  }

  return keywords
    .filter((keyword) => typeof keyword === 'string')
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .slice(0, 50)
}

export function validateReviewAnalysisPayload(body) {
  const errors = []
  const appId = getPlayStoreAppId(body?.playStoreLink)
  const filters = body?.filters || {}
  const ratingRange = filters.ratingRange || {}
  const keywords = filters.keywords || {}
  const analysis = body?.analysis || {}

  if (!appId) {
    errors.push('playStoreLink must be a valid Google Play app details URL.')
  }

  if (!isIntegerInRange(ratingRange.min, 1, 5)) {
    errors.push('filters.ratingRange.min must be an integer from 1 to 5.')
  }

  if (!isIntegerInRange(ratingRange.max, 1, 5)) {
    errors.push('filters.ratingRange.max must be an integer from 1 to 5.')
  }

  if (
    isIntegerInRange(ratingRange.min, 1, 5) &&
    isIntegerInRange(ratingRange.max, 1, 5) &&
    ratingRange.min > ratingRange.max
  ) {
    errors.push('filters.ratingRange.min cannot be greater than max.')
  }

  if (!allowedTimeRanges.has(filters.timeRange)) {
    errors.push('filters.timeRange is not supported.')
  }

  if (!isIntegerInRange(filters.minimumReviewLength, 0, 10000)) {
    errors.push('filters.minimumReviewLength must be from 0 to 10000.')
  }

  if (!isIntegerInRange(filters.maxReviewsLimit, 1, 10000)) {
    errors.push('filters.maxReviewsLimit must be from 1 to 10000.')
  }

  booleanFilterFields.forEach((field) => {
    if (typeof filters[field] !== 'boolean') {
      errors.push(`filters.${field} must be true or false.`)
    }
  })

  if (typeof analysis.goal !== 'string' || !analysis.goal.trim()) {
    errors.push('analysis.goal is required.')
  }

  if (!allowedOutputTypes.has(analysis.aiOutputType)) {
    errors.push('analysis.aiOutputType is not supported.')
  }

  if (errors.length) {
    return { errors }
  }

  return {
    errors,
    value: {
      playStoreLink: body.playStoreLink,
      appId,
      filters: {
        ratingRange: {
          min: ratingRange.min,
          max: ratingRange.max,
        },
        timeRange: filters.timeRange,
        minimumReviewLength: filters.minimumReviewLength,
        removeSpam: filters.removeSpam,
        removeDuplicates: filters.removeDuplicates,
        englishOnly: filters.englishOnly,
        keywords: {
          include: normalizeKeywords(keywords.include),
          exclude: normalizeKeywords(keywords.exclude),
        },
        maxReviewsLimit: filters.maxReviewsLimit,
      },
      analysis: {
        goal: analysis.goal.trim(),
        aiOutputType: analysis.aiOutputType,
      },
    },
  }
}
