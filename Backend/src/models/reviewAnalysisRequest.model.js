import { randomUUID } from 'node:crypto'

export class ReviewAnalysisRequest {
  constructor(request) {
    this.id = randomUUID()
    this.status = 'received'
    this.receivedAt = new Date().toISOString()
    this.request = request
  }
}
