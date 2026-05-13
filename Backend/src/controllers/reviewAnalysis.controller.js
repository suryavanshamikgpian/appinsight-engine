import {
  createReviewAnalysisRequest,
  listReviewAnalysisRequests,
} from '../services/reviewAnalysis.service.js'

export function createReviewAnalysis(request, response) {
  const savedRequest = createReviewAnalysisRequest(request.body)
  response.status(201).json(savedRequest)
}

export function listReviewAnalyses(request, response) {
  response.json(listReviewAnalysisRequests())
}
