import { ReviewAnalysisRequest } from '../models/reviewAnalysisRequest.model.js'

const requests = []

export function createReviewAnalysisRecord(request) {
  const savedRequest = new ReviewAnalysisRequest(request)
  requests.push(savedRequest)
  return savedRequest
}

export function findReviewAnalysisRecordById(id) {
  return requests.find((request) => request.id === id) || null
}

export function listReviewAnalysisRecords() {
  return [...requests]
}
