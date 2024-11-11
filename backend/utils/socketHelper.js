import Message from '../models/message.js'

const getMessageHistory = async (roomId) => {
  const messageDocuments = await Message.find({room: roomId}).populate('user')
  return messageDocuments
}

export default {getMessageHistory}