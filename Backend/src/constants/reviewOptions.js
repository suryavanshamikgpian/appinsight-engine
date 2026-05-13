export const allowedTimeRanges = new Set([
  'last_7_days',
  'last_30_days',
  'last_90_days',
  'last_180_days',
  'last_365_days',
  'all_time',
])

export const allowedOutputTypes = new Set([
  'summary',
  'pain_points',
  'feature_ideas',
  'competitor_insights',
  'action_plan',
  'json_report',
])

export const booleanFilterFields = [
  'removeSpam',
  'removeDuplicates',
  'englishOnly',
]
