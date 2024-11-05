import express from 'express'
const messagesRouter = express.Router()
import Message from '../models/message.js'

// Returns the messages in the database
messagesRouter.get('/', async (req, res) => {
  const messagesInDb = await Message.find({}).populate('user')
  return res.status(200).json(messagesInDb)
})

export default messagesRouter