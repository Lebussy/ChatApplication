import Message from '../models/message.js'

const getMessageHistory = async () => {
  const messageDocuments = await Message.find({}).populate('user')
  return messageDocuments
}

export default {getMessageHistory}