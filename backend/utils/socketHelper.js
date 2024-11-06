import Message from '../models/message.js'

const getMessageHistory = async () => {
  const messageDocuments = await Message.find({}).populate('user')
  console.log('#############message docs####################')
  console.log(messageDocuments)
  return messageDocuments
}

export default {getMessageHistory}