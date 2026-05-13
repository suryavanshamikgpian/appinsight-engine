import { Router } from 'express'
import {
  createReviewAnalysis,
  listReviewAnalyses,
} from '../controllers/reviewAnalysis.controller.js'

export const reviewAnalysisRouter = Router()

reviewAnalysisRouter.get('/', listReviewAnalyses)
reviewAnalysisRouter.post('/', createReviewAnalysis)
