import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import { notFoundHandler } from './middleware/notFoundHandler.js'
import { chatRouter } from './routes/chat.routes.js'
import { healthRouter } from './routes/health.routes.js'
import { reviewAnalysisRouter } from './routes/reviewAnalysis.routes.js'

export function createApp() {
  const app = express()

  app.use(
    cors({
      origin: env.clientOrigins.length ? env.clientOrigins : true,
    }),
  )
  app.use(express.json({ limit: '1mb' }))

  app.use('/api/health', healthRouter)
  app.use('/api/review-analysis-requests', reviewAnalysisRouter)
  app.use('/api/chat', chatRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
