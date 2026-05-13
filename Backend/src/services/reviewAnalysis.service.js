import {
  createReviewAnalysisRecord,
  listReviewAnalysisRecords,
} from '../repositories/reviewAnalysis.repository.js'
import { validateReviewAnalysisPayload } from '../schemas/reviewAnalysis.schema.js'
import { HttpError } from '../utils/httpError.js'

export function createReviewAnalysisRequest(payload) {
  const { errors, value } = validateReviewAnalysisPayload(payload)

  if (errors.length) {
    throw new HttpError(400, 'Invalid review analysis request.', errors)
  }

  return createReviewAnalysisRecord(value)
}

export function listReviewAnalysisRequests() {
  const requests = listReviewAnalysisRecords()

  return {
    count: requests.length,
    requests,
  }
}
