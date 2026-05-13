import { Router } from 'express'
import { sendChatMessage } from '../controllers/chat.controller.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const chatRouter = Router()

chatRouter.post('/messages', asyncHandler(sendChatMessage))
