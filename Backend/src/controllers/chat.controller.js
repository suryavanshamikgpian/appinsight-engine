import { createChatReply } from '../services/chat.service.js'

export async function sendChatMessage(request, response) {
  const chatResponse = await createChatReply(request.body)
  response.json(chatResponse)
}
